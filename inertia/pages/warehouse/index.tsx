import { Link, useForm } from '@inertiajs/react'
import { Column, DataTable } from '~/components/data-table'
import Spinner from '~/components/spinner'
import BoxOpenIcon from '~/components/icons/box-open.icon'
import _, { isNil } from 'lodash'
import { formatDateTime } from '../utils/common'
import { WarehaouseResponse } from '../utils/entities'
import AdminLayout from '../layouts/layout'
import Button from '~/components/button'
import { useState } from 'react'
import CreateWarehouse from './components/create-warehouse'

interface WarehouseProps {
  warehouses: WarehaouseResponse[]
}

export default function Warehouse({ warehouses }: WarehouseProps) {
  const { delete: destroy, processing } = useForm()

  const [openAddModal, setOpenAddModal] = useState<boolean>(false)

  const columns: Column<WarehaouseResponse>[] = [
    {
      Header: 'Réference',
      accessor: 'name',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <BoxOpenIcon className="h-4 w-4" />
          <Link
            href={`/dashboard/warehouses/${data.id}`}
            className=" text-blue-500 hover:underline"
          >
            {!isNil(data.reference) && data.reference}
          </Link>
        </div>
      ),
    },
    {
      Header: "Nom de l'emplacement",
      accessor: 'name',
      sortable: false,
    },
    {
      Header: 'Description',
      accessor: 'description',
      sortable: false,
    },

    {
      Header: 'Stock physique',
      accessor: 'stock',
      sortable: false,
      render: (data) => <span>{_.sumBy(data.stocks, 'physicalQuantity')}</span>,
    },

    {
      Header: 'Date de création',
      accessor: 'updatedAt',
      render: (data) => <span>{formatDateTime(data.createdAt!)}</span>,
      sortable: true,
    },

    // {
    //   Header: "Action",
    //   accessor: "available",
    //   render: (data) => (
    //     <div onClick={() => handleDetail(data)}>
    //       <EyeIcon className="h-6 w-6 text-blue-600 cursor-pointer bg-blue-50 hover:bg-blue-100 p-1 rounded-full" />
    //     </div>
    //   ),
    //   sortable: false,
    // },
  ]

  return (
    <AdminLayout title="Warehouses">
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BoxOpenIcon className="h-6 w-6" />
            <span>Emplacement</span>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              label={'Nouvel emplacement'}
              onClick={() => {
                setOpenAddModal(true)
              }}
            />
          </div>
        </div>
        <hr />
        {processing ? (
          <div className="flex flex-row h-full justify-center items-center">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <DataTable<WarehaouseResponse> columns={columns} data={warehouses} withPaginate />
          </div>
        )}
      </div>

      <CreateWarehouse
        // currentCustomer={currentCustomer}
        openAddModal={openAddModal}
        handleOpenModlal={() => setOpenAddModal(false)}
      />
    </AdminLayout>
  )
}
