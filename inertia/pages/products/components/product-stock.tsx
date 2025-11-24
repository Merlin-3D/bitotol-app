import { Link } from '@inertiajs/react'
import ProductHeader from './product-header'
import _, { isEmpty, isNil } from 'lodash'
import { useState } from 'react'
import { Column, DataTable } from '~/components/data-table'
import {
  MovementResponse,
  ProductResponse,
  StockResponse,
  WarehaouseResponse,
} from '~/pages/utils/entities'
import { BoxOpenIcon, CorrectStockIcon, StockOpenIcon } from '~/components/icons'
import { formatDateTime, formatNumber } from '~/pages/utils/common'
import Button from '~/components/button'
import CorrectStockDialog from './correct-stock-dialog'

interface ProductStockProps {
  product: ProductResponse
  warehouses: WarehaouseResponse[]
  stockProductList: StockResponse[]
  movementsProducts: MovementResponse[]
}

export default function ProductStock({
  product,
  warehouses,
  stockProductList,
  movementsProducts,
}: ProductStockProps) {
  const [openModal, setOpenModal] = useState(false)

  const [openSource, setOpenSource] = useState(false)
  const [sourceWarehaouse, setSourceWarehaouse] = useState<WarehaouseResponse | null>(null)

  const columns: Column<StockResponse>[] = [
    {
      Header: 'Emplacement',
      accessor: 'warehouse',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <BoxOpenIcon className="h-4 w-4" />
          <Link
            href={`/dashboard/warehouses/${data.warehousesId}`}
            className=" text-blue-500 hover:underline"
          >
            {data.warehouse?.reference}
          </Link>
        </div>
      ),
    },

    {
      Header: 'Libellé',
      accessor: '',
      render: (data) => <span>{data.warehouse?.name}</span>,
    },
    {
      Header: 'Stock physique',
      accessor: '',
      render: (data) => <span>{data.physicalQuantity}</span>,
    },
    {
      Header: 'Stock virtuel',
      accessor: '',
      render: (data) => <span>{data.virtualQuantity}</span>,
    },
    {
      Header: 'Prix moyen pondéré (PMP)',
      accessor: 'pmp',
      sortable: false,
      render: (data) => <span>{data.pmp ? formatNumber(data.pmp!) : ''}</span>,
    },
    {
      Header: 'Valorisation achat (PMP)',
      accessor: 'valorisationAchat',
      sortable: false,
      render: (data) => {
        console.log(data)
        return <span>{data.valorisationAchat ? formatNumber(data.valorisationAchat!) : ''}</span>
      },
    },
  ]

  return (
    <>
      <ProductHeader product={product} />
      <div className="flex items-start w-full py-2 gap-10">
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Prix de vente:</span>
            <span className="text-slate-500 text-sm">Limite stock pour alerte:</span>
            <span className="text-slate-500 text-sm">Stock désiré optimal:</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm">
              {!isNil(product.sellingPrice) ? `${product.sellingPrice} FCFA` : '#'}
            </p>
            <hr />
            <p className="text-sm">
              {!isNil(product.limitStockAlert) ? product.limitStockAlert : '#'}
            </p>
            <hr />

            <p className="text-sm">{!isNil(product.optimalStock) ? product.optimalStock : '#'}</p>
            <hr />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Stock physique:</span>
            <span className="text-slate-500 text-sm">Stock virtuel:</span>
            <span className="text-slate-500 text-sm">Dernier Mouvement:</span>
            <span className="text-slate-500 text-sm">Prix moyen pondéré (PMP):</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm">
              {!isEmpty(stockProductList) ? _.sumBy(stockProductList, 'physicalQuantity') : 0}
            </p>
            <hr />
            <p className="text-sm">
              {!isEmpty(stockProductList) ? _.sumBy(stockProductList, 'virtualQuantity') : 0}
            </p>
            <hr />
            <p className="text-sm">
              {!isEmpty(movementsProducts)
                ? formatDateTime(_.maxBy(movementsProducts, 'createdAt')?.createdAt!, true)
                : '#'}
            </p>
            <hr />
            <p className="text-sm">{formatNumber(_.sumBy(stockProductList, 'pmp'))}</p>
            <hr />
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-2 items-center">
        <Button
          color="warning"
          label="Corriger le stock"
          icon={<CorrectStockIcon className="h-4 w-4 text-white" />}
          onClick={() => {
            setOpenModal(true)
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2">
          <StockOpenIcon className="h-4 w-4" />
          Stock ({stockProductList.length})
        </h1>
        <DataTable<StockResponse>
          columns={columns}
          data={stockProductList}
          withPaginate
          itemsPerPage={50}
        />
      </div>
      <CorrectStockDialog
        product={product}
        warehouses={warehouses}
        warehaouseInfos={sourceWarehaouse}
        openDialog={openModal}
        openSource={openSource}
        setOpenDialog={() => {
          setOpenSource(false)
          setOpenModal(!openModal)
        }}
      />
    </>
  )
}
