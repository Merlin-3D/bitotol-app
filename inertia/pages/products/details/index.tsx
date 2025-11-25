import { ProductType } from '#models/enum/product_enum'
import { useState, useTransition } from 'react'
import TabView from '~/components/tab-view'
import AdminLayout from '~/pages/layouts/layout'
import { ProductResponse, WarehaouseResponse } from '~/pages/utils/entities'
import ProductInfos from '../components/product-infos'
import ProductStock from '../components/product-stock'

interface ProductsDetailsProsp {
  product: ProductResponse
  stocks: any
  movements: any
  warehouses: WarehaouseResponse[]
}

export default function ProductsDetails({
  product,
  movements,
  warehouses,
  stocks,
}: ProductsDetailsProsp) {
  const [tabValue, setTabValue] = useState<string | number>('infos')
  const [isPending, startTransition] = useTransition()

  const tabContentList = (): { [key: string]: React.ReactNode } => ({
    infos: <ProductInfos warehouses={warehouses} product={product} movementsProducts={movements} />,
    stock: (
      <ProductStock
        warehouses={warehouses}
        product={product}
        movementsProducts={movements}
        stockProductList={stocks}
      />
    ),
  })

  return (
    <AdminLayout title="Details">
      <div className="flex flex-col gap-6 h-full">
        <TabView
          onChange={(value) => {
            startTransition(() => {
              setTabValue(value.value)
            })
          }}
          headers={[
            {
              value: 'infos',
              label: 'Produit',
            },
            ...(product.type === ProductType.PRODUCT
              ? [
                  {
                    value: 'stock',
                    label: `Stock`,
                  },
                ]
              : []),
          ]}
          currentValue={tabValue}
          tabList={tabContentList()}
        />
      </div>
    </AdminLayout>
  )
}
