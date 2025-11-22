import { usePage } from '@inertiajs/react'
import { useState, useTransition } from 'react'
import TabView from '~/components/tab-view'
import AdminLayout from '~/pages/layouts/layout'
import WarehouseInfos from '../components/warehouse-infos'
import WarehouseMovement from '../components/warehouse-movement'

export default function WarehouseDetails() {
  const { props } = usePage<any>()

  const [tabValue, setTabValue] = useState<string | number>('warehouse')
  const [isPending, startTransition] = useTransition()

  const tabContentList = (): { [key: string]: React.ReactNode } => ({
    warehouse: <WarehouseInfos warehouse={props.warehouse} />,
    movement: <WarehouseMovement warehouse={props.warehouse} movements={props.movements} />,
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
              value: 'warehouse',
              label: 'Entrepôt',
            },
            {
              value: 'movement',
              label: `Mouvements de stock`,
            },
          ]}
          currentValue={tabValue}
          tabList={tabContentList()}
        />
      </div>
    </AdminLayout>
  )
}
