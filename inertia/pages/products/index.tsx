import { AlertTwotone, EyeIcon, ProductIcon } from '~/components/icons'
import AdminLayout from '../layouts/layout'
import { Column, DataTable } from '~/components/data-table'
import { ProductResponse, WarehaouseResponse } from '../utils/entities'
import {
  formatDateTime,
  formatNumber,
  getDaysUntilExpiration,
  getExpirationStyle,
} from '../utils/common'
import { Link, router } from '@inertiajs/react'
import _, { isNil } from 'lodash'
import classNames from 'classnames'
import Badge from '~/components/badge'
import Button from '~/components/button'
import { useState } from 'react'
import CreateProduct from './components/create-product'

interface ProductsProps {
  products: ProductResponse[]
  warehouses: WarehaouseResponse[]
}

export default function Products({ products, warehouses }: ProductsProps) {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)

  const columns: Column<ProductResponse>[] = [
    {
      Header: 'Réf.',
      accessor: 'name',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <ProductIcon className="h-4 w-4" />
          <Link href={`/dashboard/products/${data.id}`} className=" text-blue-500 hover:underline">
            {!isNil(data.reference) && data.reference}
          </Link>
        </div>
      ),
    },
    {
      Header: 'Libellé',
      accessor: 'name',
      sortable: false,
    },
    {
      Header: 'Prix de vente',
      accessor: 'name',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <span>
            {!isNil(data.sellingPrice) && `${formatNumber(data.sellingPrice as number)} FCFA`}
          </span>
        </div>
      ),
    },
    {
      Header: 'Stock virtuel',
      accessor: 'description',
      sortable: false,
      render: (data) => {
        const quantity = _.sumBy(data.stocks, 'virtualQuantity')
        const limitStock = data.limitStockAlert ? data.limitStockAlert : 0
        return (
          <span className="flex items-center gap-1">
            {(limitStock as number) > quantity && quantity !== 0 && (
              <AlertTwotone className="text-yellow-500 h-6 w-6" />
            )}
            {quantity}
          </span>
        )
      },
    },
    {
      Header: 'Expiration',
      accessor: 'expiredAt',
      sortable: true,
      render: (data) => {
        const daysUntilExpiration = getDaysUntilExpiration(data.expiredAt)
        const expirationStyle = getExpirationStyle(daysUntilExpiration)

        if (!data.expiredAt) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Non défini</span>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <span
              className={classNames('font-medium', {
                'text-red-500': expirationStyle.color === 'red',
                'text-orange-500': expirationStyle.color === 'orange',
                'text-green-500': expirationStyle.color === 'green',
                'text-gray-500': expirationStyle.color === 'gray',
              })}
            >
              {formatDateTime(data.expiredAt)}
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
        )
      },
    },

    {
      Header: 'Date de création',
      accessor: 'createdAt',
      render: (data) => <span>{formatDateTime(data.createdAt!)}</span>,
      sortable: true,
    },
    {
      Header: '',
      accessor: '#',
      sortable: false,
      render: (data) => (
        <div className="flex items-center justify-end gap-2 pr-2">
          <Button
            label=""
            color="info"
            onClick={() => router.visit(`/dashboard/products/${data.id}`)}
            icon={<EyeIcon className="h-4 w-4" />}
          ></Button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Produits | Services">
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ProductIcon className="h-6 w-6" />
            <span>Produits | Services ({products.length})</span>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              label={'Nouveau produit | service'}
              onClick={() => {
                setOpenAddModal(true)
              }}
            />
          </div>
        </div>
        <hr />
        <DataTable<ProductResponse> columns={columns} data={products} withPaginate />
      </div>
      <CreateProduct
        warehouses={warehouses}
        openAddModal={openAddModal}
        handleOpenModal={() => setOpenAddModal(false)}
      />
    </AdminLayout>
  )
}
