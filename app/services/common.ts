import Billings from '#models/billings'
import Product from '#models/product'
import Stock from '#models/stock'
import Warehouses from '#models/warehouses'
import _ from 'lodash'

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

export const getBillingDetails = async (id: string) => {
  const billing = await Billings.query()
    .where('id', id)
    //@ts-ignore
    .preload('user')
    //@ts-ignore
    .preload('thirdParties')
    .preload('billingItem')
    .preload('childrenBillings')
    .preload('billingPayments')
    //@ts-ignore
    .preload('parentBilling')
    .first()

  let itemData: any[] = []
  //@ts-ignore
  for (const item of billing.billingItem) {
    const vatRate = 0
    const vatAmount = item.$extras.pivot_price * vatRate

    const billingitem = {
      ..._.omit(item.$original, ['metadata', 'createdAt', 'updatedAt']),
      quantity: item.$extras.pivot_quantity,
      productId: item.$extras.pivot_product_id,
      price: item.$extras.pivot_price,
      priceIncludingVat: item.$extras.pivot_price + vatAmount,
      total: item.$extras.pivot_total,
      order_supplier_id: item.$extras.pivot_order_supplier_id,
      discount: item.$extras.pivot_discount,
      billingItemId: item.$extras.pivot_id,
      tva: item.$extras.pivot_tva,
      amountExcludingVat: item.$extras.pivot_price * item.$extras.pivot_quantity,
      // purchasePrice: { ..._.omit(purchasePrice!.$original, ['discount', 'price', 'tva']) },
    }
    itemData = [...itemData, billingitem]
  }

  const products = await Product.query()
  return {
    billing,
    products,
    item: itemData,
  }
}
