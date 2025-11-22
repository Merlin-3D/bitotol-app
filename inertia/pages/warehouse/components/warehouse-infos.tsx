import { useState } from 'react'
import { StockResponse, WarehaouseResponse } from '~/pages/utils/entities'
import {
  BoxArrowRightIcon,
  CorrectStockIcon,
  EditIcon,
  ProductIcon,
  StockOpenIcon,
  TrashIcon,
} from '~/components/icons'
import { Column, DataTable } from '~/components/data-table'
import { Link, useForm } from '@inertiajs/react'
import Button from '~/components/button'
import WarehouseHeader from './warehouse-header'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { toast } from 'react-toastify'
import CreateWarehouse from './create-warehouse'

interface WarehouseInfosProps {
  warehouse: WarehaouseResponse
}

export default function WarehouseInfos({ warehouse }: WarehouseInfosProps) {
  const { delete: destroy, processing } = useForm()

  const [openModal, setOpenModal] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openCorrectModal, setOpenCorrectModal] = useState(false)
  const [openTransfertModal, setOpenTransfertModal] = useState(false)

  const [stock, setStock] = useState<StockResponse | null>()

  const columns: Column<StockResponse>[] = [
    {
      Header: 'Produits',
      accessor: 'products',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <ProductIcon className="h-4 w-4" />
          <Link
            href={`/product?mainmenu=list-products&detail=${data.productId}`}
            className=" text-blue-500 hover:underline"
          >
            {data.product.reference}
          </Link>
        </div>
      ),
    },

    {
      Header: 'Libellé',
      accessor: '',
      render: (data) => <span>{data.product.name}</span>,
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
      accessor: 'product',
      sortable: false,
      render: () => <span></span>,
    },
    {
      Header: 'Valorisation achat (PMP)',
      accessor: 'code',
      sortable: false,
      render: () => <span></span>,
    },
    {
      Header: '',
      accessor: 'available',
      render: (data) => (
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            icon={<BoxArrowRightIcon className="h-4 w-4 text-white" />}
            label="Transférer stock"
            onClick={() => {
              setStock(data)
              setOpenTransfertModal(true)
            }}
          />
          <Button
            color="warning"
            icon={<CorrectStockIcon className="h-4 w-4 text-white" />}
            label="Corriger le stock"
            onClick={() => {
              setStock(data)
              setOpenCorrectModal(true)
            }}
          />
        </div>
      ),
      sortable: false,
    },
  ]

  const handleConfirm = async () => {
    destroy(`/dashboard/warehouses/${warehouse.id}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Suppréssion éffectuée...')
        setOpenConfirm(false)
      },
    })
  }

  return (
    <>
      <WarehouseHeader warehouse={warehouse} />
      <div className="flex flex-col justify-between gap-8">
        <div className="flex flex-row justify-end gap-2 items-center">
          <Button
            color="warning"
            label={'Modifier'}
            onClick={() => setOpenModal(true)}
            icon={<EditIcon className="h-4 w-4 text-white" />}
          />
          <Button
            color="danger"
            label={'Supprimer'}
            onClick={() => setOpenConfirm(true)}
            icon={<TrashIcon className="h-4 w-4 text-white" />}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2">
            <StockOpenIcon className="h-4 w-4" />
            Stock ({warehouse.stocks?.length})
          </h1>
          <DataTable<StockResponse> columns={columns} data={[]} withPaginate itemsPerPage={50} />
        </div>
      </div>

      <ConfirmDialog
        isOpen={openConfirm}
        isLoading={processing}
        setOpen={() => setOpenConfirm(!openConfirm)}
        onConfirm={handleConfirm}
      />
      <CreateWarehouse
        currentWarehouse={warehouse}
        openAddModal={openModal}
        handleOpenModlal={() => setOpenModal(false)}
      />
      {/* 

      {!isNull(stock) && (
        <CorrectStockDialog
          user={user!}
          product={stock?.product!}
          warehaouseInfos={warehouseStore.warehouse}
          openDialog={openCorrectModal}
          openSource={true}
          setOpenDialog={() => {
            warehouseStore.updateStockWarehouse(productStore.stockProductList)
            warehouseStore.fetchMovementWarehouse(warehouseStore.warehouse.id)
            setOpenCorrectModal(!openCorrectModal)
          }}
        />
      )}
      {!isEmpty(stock) && (
        <TransfertStockDialog
          user={user!}
          warehaouse={warehouseStore.warehouse}
          product={stock?.product!}
          openSource={true}
          openTransfertDialog={openTransfertModal}
          setOpenopenTransfertDialog={() => {
            warehouseStore.updateStockWarehouse(productStore.stockProductList)
            warehouseStore.fetchMovementWarehouse(warehouseStore.warehouse.id)
            setOpenTransfertModal(!openTransfertModal)
          }}
        />
      )} */}
    </>
  )
}
