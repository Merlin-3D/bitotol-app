import { Link } from '@inertiajs/react'
import _, { isNil } from 'lodash'
import { formatDateTime } from '~/pages/utils/common'
import { WarehaouseResponse } from '~/pages/utils/entities'
import WarehouseIcon from '~/components/icons/warehouse.icon'

interface WarehouseHeaderProps {
  warehouse: WarehaouseResponse
}

export default function WarehouseHeader({ warehouse }: WarehouseHeaderProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-start gap-4">
          <div className="shadow-lg rounded-lg relative p-4">
            <WarehouseIcon className="rounded w-12 h-12" />
          </div>
          <div className="flex flex-col justify-between gap-2">
            <div className="flex flex-col">
              <h1 className="capitalize font-medium text-lg flex items-center gap-4">
                Réf. {warehouse.reference}
              </h1>
              <h1 className="capitalize font-medium text-base text-sub-headings flex items-center gap-4">
                {warehouse.name}
              </h1>
            </div>
            <span className="capitalize font-medium text-xs">
              Ajouter le: {formatDateTime(warehouse.createdAt!, true)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end gap-8">
          <Link href={`/dashboard/warehouses`} className=" font-medium text-lg">
            Retour a la liste
          </Link>
        </div>
      </div>
      <hr />
      <div className="flex items-start w-full py-2 gap-10">
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Téléphone:</span>
            <span className="text-slate-500 text-sm">Nombre total de produits:</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm">{!isNil(warehouse.phone) ? warehouse.phone : '#'}</p>

            <hr />

            <p className="text-sm">{_.sumBy(warehouse.stocks, 'physicalQuantity')}</p>
            <hr />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Adresse:</span>
            <span className="text-slate-500 text-sm">Desctiption:</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm">{!isNil(warehouse.address) ? warehouse.address : '#'}</p>
            <hr />
            <p className="text-sm">{!isNil(warehouse.description) ? warehouse.description : '#'}</p>
            <hr />
          </div>
        </div>
      </div>
    </div>
  )
}
