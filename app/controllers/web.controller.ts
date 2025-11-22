import Movement from '#models/movement'
import Stock from '#models/stock'
import ThirdParties from '#models/third_parties'
import Warehouses from '#models/warehouses'
import { getWarehouseList } from '#services/common'
import type { HttpContext } from '@adonisjs/core/http'

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
}
