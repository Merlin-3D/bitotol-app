import { Column, DataTable } from '~/components/data-table'
import WarehouseHeader from './warehouse-header'
import classNames from 'classnames'
import { PackageMovementIcon, ProductIcon } from '~/components/icons'
import { Link } from '@inertiajs/react'
import { MovementResponse, WarehaouseResponse } from '~/pages/utils/entities'
import { formatDateTime } from '~/pages/utils/common'

interface WarehouseInfosProps {
  warehouse: WarehaouseResponse
  movements: MovementResponse[]
}

export default function WarehouseMovement({ warehouse, movements }: WarehouseInfosProps) {
  const columns: Column<MovementResponse>[] = [
    {
      Header: 'Réf. produit',
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
          <Link
            href={`/products/${data.stock.product.id}`}
            className=" text-blue-500 hover:underline"
          >
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
    {
      Header: 'Quantité',
      accessor: 'quantity',
      sortable: false,
      render: (data) => (
        <div className="flex items-end justify-end gap-1 pr-2">
          <span
            className={classNames(
              'font-semibold',
              { 'text-green-600': data.movementQuantity.startsWith('+') },
              { 'text-red-600': data.movementQuantity.startsWith('-') }
            )}
          >
            {data.movementQuantity}
          </span>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <WarehouseHeader warehouse={warehouse} />
      <div className="flex flex-col justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2">
            <PackageMovementIcon className="h-4 w-4" />
            Liste des mouvements de stock ({movements.length})
          </h1>
          <DataTable<MovementResponse>
            columns={columns}
            data={movements}
            withPaginate
            itemsPerPage={50}
          />
        </div>
      </div>
    </div>
  )
}
