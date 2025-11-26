import { useState, useTransition } from 'react'
import TabView from '~/components/tab-view'
import AdminLayout from '~/pages/layouts/layout'
import BillingsSupplierInfo from '../components/billings-supplier-info'
import { BillingItem, BillingResponse, ProductResponse } from '~/pages/utils/entities'
import ThirdParties from '#models/third_parties'

interface BillingsDetailsProsp {
  item: BillingItem[]
  billing: BillingResponse
  products: ProductResponse[]
  customers: ThirdParties[]
}

export default function BillingsDetails({
  item,
  billing,
  customers,
  products,
}: BillingsDetailsProsp) {
  const [tabValue, setTabValue] = useState<string | number>('infos')
  const [isPending, startTransition] = useTransition()

  const tabContentList = (): { [key: string]: React.ReactNode } => ({
    infos: (
      <BillingsSupplierInfo
        customers={customers}
        item={item}
        billing={billing}
        products={products}
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
              label: 'Facture client',
            },
          ]}
          currentValue={tabValue}
          tabList={tabContentList()}
        />
      </div>
    </AdminLayout>
  )
}
