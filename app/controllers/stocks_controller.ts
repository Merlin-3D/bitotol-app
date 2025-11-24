import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import _ from 'lodash'
import Movement from '#models/movement'
import { MovementType } from '#models/enum/product_enum'
import Stock from '#models/stock'
import * as validator from '#validators/stocks'
import { getWarehouseList } from '#services/common'
import Product from '#models/product'

export default class StocksController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, params, auth, inertia }: HttpContext) {
    const { id } = params

    const data = await request.validateUsing(validator.stockStore)

    let stock = await Stock.query()
      .where('warehousesId', data.warehousesId)
      .where('productId', data.productId)
      .preload('warehouse')
      .first()

    if (!stock) {
      stock = new Stock()
      stock.warehousesId = data.warehousesId
      stock.productId = data.productId
      stock.physicalQuantity = data.physicalQuantity
      stock.virtualQuantity = data.virtualQuantity
      stock.unitPurchasePrice = data.unitPurchasePrice
      //@ts-ignore
      stock.userId = auth.user?.id!
    }

    if (data.type === MovementType.ENTER || data.type === MovementType.RECEPTION) {
      stock.physicalQuantity += Number(data.quantity)
      stock.virtualQuantity += Number(data.quantity)
    } else if (data.type === MovementType.OUT || data.type === MovementType.SHIPPING) {
      stock.physicalQuantity -= Number(data.quantity)
      stock.virtualQuantity -= Number(data.quantity)
    } else if (data.type === MovementType.CORRECTION) {
      stock.physicalQuantity = Number(data.quantity)
    }

    await stock.save()

    const mouvement = new Movement()

    mouvement.stockId = stock.id
    mouvement.movementQuantity =
      data.type === MovementType.ENTER ||
      data.type === MovementType.RECEPTION ||
      data.type === MovementType.CORRECTION
        ? `${data.quantity}`
        : `${data.quantity}`
    mouvement.movementType = data.type
    mouvement.title = data.title
    mouvement.amount = Number(data.unitPurchasePrice)
    //@ts-ignore
    mouvement.userId = auth.user?.id!
    mouvement.code = DateTime.fromJSDate(new Date()).toFormat('yyyyLLddHHmmss')

    await mouvement.save()
    const stocks = await Stock.query()
      .where('productId', data.productId)
      //@ts-ignore
      .preload('warehouse')
      //@ts-ignore
      .preload('product')

    let movements: any[] = []

    for (const element of _.map(stocks, 'id')) {
      const item = await Movement.query()
        .where('stockId', element)
        //@ts-ignore
        .preload('user')

      movements = [...movements, ...item]
    }

    const product = await Product.query()
      .where('id', id)
      .preload('warehouse')
      //@ts-ignore
      .preload('user')
      .first()

    // Calculer le PMP et la valorisation d'achat pour chaque stock
    const stocksWithPMP = await Promise.all(
      stocks.map(async (item: any) => {
        const stockHistory = await Stock.query()
          .where('productId', id)
          .where('warehousesId', item.warehousesId) // Filtrer par le même entrepôt
          //@ts-ignore
          .where('createdAt', '<=', item.createdAt) // Inclure uniquement les stocks jusqu'à la date de création actuelle
          .orderBy('createdAt', 'asc') // Trier par date de création pour un calcul correct

        let totalWeightedPrice = 0
        let totalQuantity = 0

        stockHistory.forEach((sh) => {
          totalWeightedPrice += sh.unitPurchasePrice * sh.physicalQuantity
          totalQuantity += sh.physicalQuantity
        })

        const pmp = totalQuantity ? totalWeightedPrice / totalQuantity : 0

        // Calculer la valorisation d'achat
        const valorisationAchat = stock.physicalQuantity * stock.unitPurchasePrice

        return {
          ...stock.toJSON(),
          pmp, // Ajouter le PMP à chaque entrée de stock
          valorisationAchat, // Ajouter la valorisation d'achat à chaque entrée de stock
        }
      })
    )
    const warehouses = await getWarehouseList()
    return inertia.render(
      'products/details/index',
      {
        product,
        warehouses,
        movements: _.orderBy(_.flattenDeep(movements), ['createdAt'], ['desc']),
        stocks: stocksWithPMP,
      },
      { title: 'Produit' }
    )
  }

  async allMovments({ response }: HttpContext) {
    try {
      const movements = await Movement.query()
        .orderBy('movements.updated_at', 'desc')
        .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
        //@ts-ignore
        .preload('stock', (stockQuery) => {
          //@ts-ignore
          stockQuery.preload('product')
        })
        //@ts-ignore
        .preload('order')
        //@ts-ignore
        .preload('sale')

      return response.json({ movements })
    } catch (error) {
      console.log(error)
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Show individual record
   */
  async show({}: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}
