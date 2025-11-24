import { Column, DataTable } from '~/components/data-table'
import { AlertTwotone, ProductIcon } from '~/components/icons'
import Input from '~/components/input'
import { ProductResponse } from '../utils/entities'
import { useMemo, useState } from 'react'
import _, { isEmpty, isNil } from 'lodash'
import {
  formatDateTime,
  formatNumber,
  getDaysUntilExpiration,
  getExpirationStyle,
} from '../utils/common'
import { Link } from '@inertiajs/react'
import classNames from 'classnames'
import AdminLayout from '../layouts/layout'

interface StockProps {
  products: ProductResponse[]
}

export default function Stock({ products }: StockProps) {
  const [searchQuery, setSearchQuery] = useState<string>('')

  const columns: Column<ProductResponse>[] = [
    {
      Header: 'Réf. produit',
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
      Header: 'Type',
      accessor: 'type',
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
      Header: 'Stock physique',
      accessor: 'stock',
      sortable: false,
      render: (data) => {
        const quantity = _.sumBy(data.stocks, 'physicalQuantity')
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
      Header: 'Stock virtuel',
      accessor: 'stock',
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
      Header: 'Jours restants',
      accessor: 'expiredAt',
      sortable: true,
      render: (data) => {
        const daysUntilExpiration = getDaysUntilExpiration(data.expiredAt)
        const expirationStyle = getExpirationStyle(daysUntilExpiration)

        if (daysUntilExpiration === null) {
          return <span className="text-gray-400">-</span>
        }

        return (
          <div className="flex items-center gap-2">
            <span
              className={classNames('font-semibold', {
                'text-red-500': expirationStyle.color === 'Crimson',
                'text-orange-500': expirationStyle.color === 'orange',
                'text-green-500': expirationStyle.color === 'green',
              })}
            >
              {daysUntilExpiration} jours
            </span>
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
  ]

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase()
    setSearchQuery(searchValue)
  }

  const filteredProduct = useMemo(() => {
    if (isEmpty(searchQuery)) {
      return products
    }
    if (isEmpty(products)) {
      return []
    }

    return products.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, products])

  return (
    <AdminLayout title="Details">
      <section className=" h-full">
        <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ProductIcon className="h-6 w-6" />
              <span>
                Produits en stock{' '}
                <span className="text-sub-heading">({filteredProduct.length})</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Rechercher: Libellé, Réf. produit"
                value={searchQuery}
                onChange={handleSearch}
                className='w-96'
              />
              {/* <FilterIcon className="h-6 w-6 cursor-pointer" /> */}
            </div>
          </div>
          <hr />
          <div className="overflow-y-auto h-full">
            <DataTable<ProductResponse>
              columns={columns}
              data={filteredProduct}
              withPaginate
            />{' '}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
