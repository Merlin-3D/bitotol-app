import Movement from '#models/movement'
import Stock from '#models/stock'
import Warehouses from '#models/warehouses'
import { getWarehouseList } from '#services/common'
import * as validator from '#validators/stocks'
import type { HttpContext } from '@adonisjs/core/http'

export default class WarehousesController {
  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, inertia }: HttpContext) {
    try {
      const data = await request.validateUsing(validator.warehouseStore)
      const warehouse = await new Warehouses().merge(data).save()
      const warehouses = await getWarehouseList()
      return inertia.render('warehouse/index', { warehouse, warehouses }, { title: 'Emplacement' })
    } catch (error) {
      return inertia.render('warehouse/index', { error }, { title: 'Clients' })
    }
  }

  /**
   * Show individual record
   */
  async show({ response, params }: HttpContext) {
    const { id } = params
    try {
      const warehouse = await Warehouses.query()
        .where('id', id) //@ts-ignore
        .preload('country')

      if (!warehouse) {
        return response.send({ warehouses: [] })
      }

      const stocks = await Stock.query()
        .where('warehousesId', warehouse[0].id)
        //@ts-ignore
        .preload('product')

      return response.send({ ...warehouse[0].$original, ...warehouse[0].$preloaded, stocks })
    } catch (error) {
      console.log(error)
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  async showMovmentByWarehouseId({ response, params }: HttpContext) {
    const { id } = params
    try {
      const movements = await Movement.query()
        .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
        .where('stocks.warehouses_id', id)
        //@ts-ignore
        .preload('stock', (stockQuery) => {
          //@ts-ignore
          stockQuery.preload('product')
        })

      return response.json({ movements })
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
  async update({ params, request, inertia }: HttpContext) {
    try {
      const { id } = params
      const warehouse = await Warehouses.findByOrFail('id', id)
      const payload = await request.validateUsing(validator.warehouseStore)

      if (!warehouse) {
        return null
      }
      warehouse.name = payload.name
      warehouse.address = payload.address ? payload.address : warehouse.address
      warehouse.phone = payload.phone ? payload.phone : warehouse.phone
      warehouse.description = payload.description ? payload.description : warehouse.description

      await warehouse.save()

      const warehouseUpdate = await Warehouses.query().where('id', id).first()

      if (!warehouseUpdate) {
        return inertia.render(
          'warehouse/details/index',
          { warehouse, movements: [] },
          { title: 'Emplacement' }
        )
      }

      const stocks = await Stock.query()
        .where('warehousesId', warehouseUpdate.id)
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
        { warehouse: { ...warehouseUpdate.$original, stocks }, movements },
        { title: 'Emplacement' }
      )
    } catch (error) {
      return inertia.render('warehouse/details/index', { error }, { title: 'Emplacement' })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, inertia }: HttpContext) {
    const { id } = params
    const warehouse = await Warehouses.findByOrFail('id', id)
    await warehouse.delete()
    const warehouses = await getWarehouseList()
    return inertia.render('warehouse/index', { warehouse, warehouses }, { title: 'Emplacement' })
  }
}
