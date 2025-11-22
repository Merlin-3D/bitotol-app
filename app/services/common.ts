import Stock from '#models/stock'
import Warehouses from '#models/warehouses'

export const getWarehouseList = async () => {
  const warehousesList = await Warehouses.query().orderBy('created_at', 'desc')

  let warehouses: any[] = []

  if (warehousesList) {
    for (const warehouse of warehousesList) {
      const stocks = await Stock.query()
        .where('warehousesId', warehouse.id)
        //@ts-ignore
        .preload('product')

      warehouses = [
        ...warehouses,
        {
          ...warehouse.$original,
          ...warehouse.$preloaded,
          stocks,
        },
      ]
    }
  }

  return warehouses
}
