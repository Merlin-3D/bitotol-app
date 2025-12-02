import classNames from 'classnames'
import AdminLayout from '../layouts/layout'
import { MovementResponse } from '../utils/entities'
import { Column, DataTable } from '~/components/data-table'
import { PackageMovementIcon, ProductIcon } from '~/components/icons'
import { Link } from '@inertiajs/react'
import { formatDateTime } from '../utils/common'

interface MovementListProps {
  movements: MovementResponse[]
}

export default function MovementList({ movements }: MovementListProps) {
  const columns: Column<MovementResponse>[] = [
    {
      Header: 'Réf. mouvement',
      accessor: 'reference',
      sortable: false,
    },
    {
      Header: 'Libellé du mouvement',
      accessor: 'title',
      sortable: false,
    },
    {
      Header: 'Réf. produit',
      accessor: 'name',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <ProductIcon className="h-4 w-4" />
          <Link href={`/dashboard/products/${data.stock.productId}`} className=" text-blue-500 hover:underline">
            {data.stock.product.reference}
          </Link>
        </div>
      ),
    },
    {
      Header: 'Code du mouvement',
      accessor: 'code',
    },
    {
      Header: 'Date du mouvement',
      accessor: 'type',
      sortable: false,
      render: (data) => <span>{formatDateTime(data.movementDate, true)}</span>,
    },
    // {
    //   Header: 'Origine',
    //   accessor: '#',
    //   sortable: false,
    //   render: (data) => (
    //     <span>
    //       {!isNil(data.order) ? (
    //         <Link
    //           href={
    //             data.order.type === 'customer'
    //               ? `/orders?mainmenu=list-customer-orders&detail=${data.order.id}`
    //               : `/orders?mainmenu=list-suppliers-orders&detail=${data.order.id}`
    //           }
    //           className=" text-blue-500 hover:underline"
    //         >
    //           {data.order.code}
    //         </Link>
    //       ) : !isNil(data.sale) ? (
    //         <Link href={'#'} className=" text-blue-500 hover:underline">
    //           {`POS${data.sale.ticketNumber}`}
    //         </Link>
    //       ) : (
    //         <></>
    //       )}
    //     </span>
    //   ),
    // },
    {
      Header: 'Quantité',
      accessor: 'quantity',
      sortable: false,
      render: (data) => (
        <div className="flex items-end justify-end gap-1 pr-2">
          <span
            className={classNames(
              'font-semibold',
              { 'text-green-600': data.movementType !== 'out' },
              { 'text-red-600': data.movementType === 'out' }
            )}
          >
            {data.movementType === 'out' ? (
              <span className="text-red-600">-</span>
            ) : (
              <span className="text-green-600">+</span>
            )}{' '}
            {data.movementQuantity}
          </span>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Details">
      <section className=" h-full">
        <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageMovementIcon className="h-6 w-6" />
              <span>
                Liste des mouvements de stock{' '}
                <span className="text-sub-heading">({movements.length})</span>
              </span>
            </div>
          </div>
          <hr />
          <div className="overflow-y-auto h-full">
            <DataTable<MovementResponse> columns={columns} data={movements} withPaginate />{' '}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
