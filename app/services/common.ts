import Product from '#models/product'
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

export const getProductsList = async () => {
  const productsFind = await Product.query()
    //@ts-ignore
    .preload('warehouse')
    //@ts-ignore
    .preload('user')
    .orderBy('created_at', 'desc')

  let products: any[] = []

  if (!productsFind) {
    return []
  }

  for (const product of productsFind) {
    const stocks = await Stock.query()
      .where('productId', product.id)
      //@ts-ignore
      .preload('warehouse')

    products = [
      ...products,
      {
        ...product.$original,
        ...product.$preloaded,
        stocks,
      },
    ]
  }
  return products
}
