import ProductHeader from './product-header'
import _, { isEmpty, isNil } from 'lodash'
import { useState } from 'react'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import { MovementResponse, ProductResponse } from '~/pages/utils/entities'
import { Column, DataTable } from '~/components/data-table'
import CustomerIcon from '~/components/icons/customers.icon'
import {
  formatDateTime,
  formatNumber,
  getDaysUntilExpiration,
  getExpirationStyle,
} from '~/pages/utils/common'
import { ProductType } from '#models/enum/product_enum'
import { AlertTwotone, PackageMovementIcon, ProductIcon, ServiceIcon } from '~/components/icons'
import Badge from '~/components/badge'
import { ConfirmDialog } from '~/components/confirm-dialog'

interface ProductInfosProps {
  product: ProductResponse
  movementsProducts: MovementResponse[]
}

export default function ProductInfos({ product, movementsProducts }: ProductInfosProps) {
  const [openModal, setOpenModal] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openClone, setOpenClone] = useState(false)

  const [refProduct, setRefProduct] = useState<string>('')
  const [cloneAllData, setCloneAllData] = useState(false)
  const [cloneCategory, setCloneCategory] = useState(false)

  const columns: Column<MovementResponse>[] = [
    {
      Header: 'Réference',
      accessor: 'reference',
      sortable: false,
    },
    {
      Header: 'Libellé du mouvement',
      accessor: 'title',
      sortable: false,
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
      Header: 'Éffectuer Par',
      accessor: 'user',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <CustomerIcon className="h-4 w-4" />
          <span>{data.user.name}</span>
        </div>
      ),
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

  const handleConfirm = async () => {
    // await productStore.deleteProduct(productStore.product.id as string)
    // if (!isEmpty(productStore.successMessage)) {
    //   toast.success(productStore.successMessage)
    //   setOpenConfirm(false)
    //   if (type === ProductType.PRODUCT) {
    //     router.push(`/product?mainmenu=list-products`)
    //   } else {
    //     router.push(`/product?mainmenu=list-services`)
    //   }
    // } else {
    //   toast.error(productStore.errorCreateMessage)
    // }
  }

  const daysUntilExpiration = getDaysUntilExpiration(product.expiredAt)
  const expirationStyle = getExpirationStyle(daysUntilExpiration)

  return (
    <div className="flex flex-col gap-4">
      <ProductHeader product={product} />
      <div className="flex items-start w-full py-2 gap-10">
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Type</span>

            {product.type === ProductType.PRODUCT && (
              <span className="text-slate-500 text-sm">Emplacement</span>
            )}

            {product.type === ProductType.PRODUCT && (
              <span className="text-slate-500 text-sm">Limite stock pour alerte</span>
            )}
            {product.type === ProductType.PRODUCT && (
              <span className="text-slate-500 text-sm">Stock désiré optimal</span>
            )}

            {product.type === ProductType.SERVICE && (
              <span className="text-slate-500 text-sm">Prix de vente </span>
            )}
            <span className="text-slate-500 text-sm">Description</span>
          </div>

          <div className="col-span-4 grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              {!isNil(product.type) && product.type === ProductType.PRODUCT ? (
                <ProductIcon className="h-4 w-4" />
              ) : (
                <ServiceIcon className="h-4 w-4" />
              )}
              <p className="text-sm">
                {!isNil(product.type)
                  ? product.type === ProductType.PRODUCT
                    ? 'Produit'
                    : 'Service'
                  : '#'}
              </p>
            </div>

            {product.type === ProductType.PRODUCT && <hr />}

            {product.type === ProductType.PRODUCT && (
              <p className="text-sm">
                {!isNil(product.warehouse)
                  ? `${product.warehouse.reference!} >> ${product.warehouse!.name!}`
                  : '#'}
              </p>
            )}

            {product.type === ProductType.PRODUCT && <hr />}

            {product.type === ProductType.PRODUCT && (
              <p className="text-sm">
                {!isNil(product.limitStockAlert) ? product.limitStockAlert : '#'}
              </p>
            )}

            {product.type === ProductType.PRODUCT && <hr />}
            {product.type === ProductType.PRODUCT && (
              <p className="text-sm">{!isNil(product.optimalStock) ? product.optimalStock : '#'}</p>
            )}

            <hr />
            {product.type === ProductType.SERVICE && (
              <p className="text-sm">
                {!isNil(product.sellingPrice)
                  ? `${formatNumber(product.sellingPrice as number)} FCFA`
                  : '#'}
              </p>
            )}

            {product.type === ProductType.SERVICE && <hr />}
            <p className="text-sm">{!isNil(product.description) ? product.description : '#'}</p>
            <hr />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Date d&apos;expiration</span>
            {product.type === ProductType.PRODUCT && (
              <span className="text-slate-500 text-sm">Prix de vente</span>
            )}
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm">
              {product.expiredAt && (
                <div className="flex items-center gap-2">
                  <span
                    className={classNames('font-medium', {
                      'text-red-500': expirationStyle.color === 'red',
                      'text-orange-500': expirationStyle.color === 'orange',
                      'text-green-500': expirationStyle.color === 'green',
                      'text-gray-500': expirationStyle.color === 'gray',
                    })}
                  >
                    {formatDateTime(product.expiredAt)}
                  </span>
                  <Badge type={expirationStyle.badge as any} text={expirationStyle.text} />
                  {daysUntilExpiration !== null && daysUntilExpiration <= 30 && (
                    <AlertTwotone
                      className={classNames('h-4 w-4', {
                        'text-red-500': daysUntilExpiration <= 7,
                        'text-orange-500': daysUntilExpiration > 7 && daysUntilExpiration <= 30,
                      })}
                    />
                  )}
                </div>
              )}
            </p>

            {product.type === ProductType.PRODUCT && <hr />}
            {product.type === ProductType.PRODUCT && (
              <p className="text-sm">
                {!isNil(product.sellingPrice)
                  ? `${formatNumber(product.sellingPrice as number)} FCFA`
                  : '#'}
              </p>
            )}

            <hr />
          </div>
        </div>
      </div>

      {product.type === ProductType.PRODUCT && (
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-2">
            <PackageMovementIcon className="h-4 w-4" />
            Les mouvements liés ({movementsProducts.length})
          </h1>

          <DataTable<MovementResponse>
            columns={columns}
            data={movementsProducts}
            itemsPerPage={50}
            withPaginate
          />
        </div>
      )}

      {/* <DialogModal
        title={type === ProductType.PRODUCT ? 'Modifier le produit' : 'Modifier le service'}
        open={openModal}
        setOpen={() => setOpenModal(!openModal)}
        size="5xl"
        color={'Goldrush'}
      >
        <ProductForm
          productInfos={productStore.product}
          setOpen={() => setOpenModal(!openModal)}
          type={type}
        />
      </DialogModal> */}

      {/* <ConfirmDialog
        isOpen={openConfirm}
        isLoading={productStore.createdLoading}
        setOpen={() => setOpenConfirm(!openConfirm)}
        onConfirm={handleConfirm}
      /> */}
    </div>
  )
}
