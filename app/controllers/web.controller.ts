import Billings from '#models/billings'
import Movement from '#models/movement'
import Product from '#models/product'
import Stock from '#models/stock'
import ThirdParties from '#models/third_parties'
import Warehouses from '#models/warehouses'
import { getBillingDetails, getProductsList, getWarehouseList } from '#services/common'
import type { HttpContext } from '@adonisjs/core/http'
import _ from 'lodash'

export default class WebController {
  async login({ inertia }: HttpContext) {
    return inertia.render('home', {}, { title: 'Login' })
  }

  async dashboard({ inertia }: HttpContext) {
    return inertia.render('dashboard/home', {}, { title: 'Dashboard' })
  }

  async customers({ inertia }: HttpContext) {
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')
    return inertia.render('customers/index', { customers }, { title: 'Clients' })
  }

  async customersDetails({ inertia }: HttpContext) {
    return inertia.render('customers/details/index', {}, { title: 'Détails' })
  }

  async warehouses({ inertia }: HttpContext) {
    const warehouses = await getWarehouseList()

    return inertia.render('warehouse/index', { warehouses }, { title: 'Emplacement' })
  }

  async warehousesDetails({ params, inertia }: HttpContext) {
    const { id } = params

    const warehouse = await Warehouses.query().where('id', id).first()

    if (!warehouse) {
      return inertia.render(
        'warehouse/details/index',
        { warehouse, movements: [] },
        { title: 'Emplacement' }
      )
    }

    const stocks = await Stock.query()
      .where('warehousesId', warehouse.id)
      //@ts-ignore
      .preload('product')

    const movements = await Movement.query()
      .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
      .where('stocks.warehouses_id', id)
      //@ts-ignore
      .preload('stock', (stockQuery) => {
        //@ts-ignore
        stockQuery.preload('product')
      })

    return inertia.render(
      'warehouse/details/index',
      { warehouse: { ...warehouse.$original, stocks }, movements },
      { title: 'Emplacement' }
    )
  }

  async products({ inertia }: HttpContext) {
    const products = await getProductsList()
    const warehouses = await getWarehouseList()

    return inertia.render('products/index', { products, warehouses }, { title: 'Produits' })
  }

  async productsDetails({ params, inertia }: HttpContext) {
    const { id } = params

    const product = await Product.query()
      .where('id', id)
      .preload('warehouse')
      //@ts-ignore
      .preload('user')
      .first()

    const stocks = await Stock.query()
      .where('productId', id)
      //@ts-ignore
      .preload('warehouse')

    // Calculer le PMP et la valorisation d'achat pour chaque stock
    const stocksWithPMP = await Promise.all(
      stocks.map(async (stock) => {
        const stockHistory = await Stock.query()
          .where('productId', id)
          .where('warehousesId', stock.warehousesId) // Filtrer par le même entrepôt
          //@ts-ignore
          .where('createdAt', '<=', stock.createdAt) // Inclure uniquement les stocks jusqu'à la date de création actuelle
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

    let movements: any[] = []

    for (const element of _.map(stocks, 'id')) {
      const item = await Movement.query()
        .where('stockId', element)
        //@ts-ignore
        .preload('user')

      movements = [...movements, ...item]
    }
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

  async stocks({ inertia }: HttpContext) {
    const products = await getProductsList()

    return inertia.render('stocks/index', { products }, { title: 'Produits' })
  }

  async movements({ inertia }: HttpContext) {
    const movements = await Movement.query()
      .orderBy('movements.updated_at', 'desc')
      .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
      //@ts-ignore
      .preload('stock', (stockQuery) => {
        //@ts-ignore
        stockQuery.preload('product')
      })

    return inertia.render('movement/index', { movements }, { title: 'Movement' })
  }

  async billings({ inertia, request }: HttpContext) {
    const query = Billings.query() //@ts-ignore
      .preload('thirdParties')

    // Filtres
    const status = request.qs().status
    const customerId = request.qs().customerId
    const type = request.qs().type
    const dateFrom = request.qs().dateFrom
    const dateTo = request.qs().dateTo
    const amountMin = request.qs().amountMin
    const amountMax = request.qs().amountMax

    if (status) {
      query.where('status', status)
    }

    if (customerId) {
      query.where('thirdPartiesId', customerId)
    }

    if (type) {
      query.where('type', type)
    }

    if (dateFrom) {
      query.where('billingDate', '>=', dateFrom)
    }

    if (dateTo) {
      query.where('billingDate', '<=', dateTo)
    }

    if (amountMin) {
      query.where('amountIncludingVat', '>=', amountMin)
    }

    if (amountMax) {
      query.where('amountIncludingVat', '<=', amountMax)
    }

    const billings = await query.orderBy('created_at', 'desc')
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')

    return inertia.render('billings/index', { billings, customers }, { title: 'Billings' })
  }

  async billingDetails({ params, inertia, request }: HttpContext) {
    const { id } = params
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')
    const { billing, products, item } = await getBillingDetails(id)
    return inertia.render(
      'billings/details/index',
      { billing, products, item, customers, csrfToken: request.csrfToken },
      { title: 'Détails' }
    )
  }
}
