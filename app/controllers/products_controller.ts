import Product from '#models/product'
import Stock from '#models/stock'
import type { HttpContext } from '@adonisjs/core/http'
import * as validator from '#validators/stocks'
import { getProductsList, getWarehouseList } from '#services/common'

export default class ProductsController {
  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, inertia }: HttpContext) {
    const data = await request.validateUsing(validator.productStore)

    await new Product()
      .merge({
        ...data,
        limitStockAlert: data.limitStockAlert ? Number(data.limitStockAlert) : 0,
        optimalStock: data.optimalStock ? Number(data.optimalStock) : 0,
        sellingPrice: data.sellingPrice ? Number(data.sellingPrice) : 0,
        //@ts-ignore
        userId: auth.user?.id!,
      })
      .save()
    const products = await getProductsList()
    const warehouses = await getWarehouseList()

    return inertia.render('products/index', { products, warehouses }, { title: 'Produits' })
  }

  /**
   * Show individual record
   */
  async show({ response, params }: HttpContext) {
    const { id } = params
    try {
      const product = await Product.query()
        .where('id', id)
        .preload('warehouse')
        //@ts-ignore
        .preload('user')

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
      return response.send({ product, stocks: stocksWithPMP })
    } catch (error) {
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const product = await Product.findByOrFail('id', id)
      const payload = await request.validateUsing(validator.productStore)

      if (!product) {
        return null
      }
      product.name = payload.name
      product.active = payload.active
      product.description = payload.description ? payload.description : null
      product.warehousesId = payload.warehousesId ? payload.warehousesId : null
      product.limitStockAlert = payload.limitStockAlert ? Number(payload.limitStockAlert) : null
      product.optimalStock = payload.optimalStock ? Number(payload.optimalStock) : null
      product.sellingPrice = payload.sellingPrice ? Number(payload.sellingPrice) : null
      product.expiredAt = payload.expiredAt ? payload.expiredAt : null

      await product.save()
      return await Product.query()
        .where('id', id)
        //@ts-ignore
        .preload('warehouse')
        //@ts-ignore
        .preload('user')
    } catch (error) {
      console.log(error)
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const { id } = params
      const product = await Product.findByOrFail('id', id)

      await product.delete()
      return response.send({ id })
    } catch (error) {
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }
}
