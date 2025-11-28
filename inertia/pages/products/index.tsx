import { AlertTwotone, EyeIcon, ProductIcon } from '~/components/icons'
import AdminLayout from '../layouts/layout'
import { Column, DataTable } from '~/components/data-table'
import { ProductResponse, WarehaouseResponse } from '../utils/entities'
import {
  formatDateTime,
  formatNumber,
  getDaysUntilExpiration,
  getExpirationStyle,
  productType,
} from '../utils/common'
import { Link, router } from '@inertiajs/react'
import _, { isNil } from 'lodash'
import classNames from 'classnames'
import Badge from '~/components/badge'
import Button from '~/components/button'
import { useState, useEffect } from 'react'
import CreateProduct from './components/create-product'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import { ProductType } from '#models/enum/product_enum'

interface ProductsProps {
  products: ProductResponse[]
  warehouses: WarehaouseResponse[]
}

interface ProductFilters {
  type: string | null
  warehouseId: string | null
  search: string | null
  expirationFrom: string | null
  expirationTo: string | null
}

export default function Products({ products, warehouses }: ProductsProps) {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filters, setFilters] = useState<ProductFilters>({
    type: null,
    warehouseId: null,
    search: null,
    expirationFrom: null,
    expirationTo: null,
  })

  // Récupérer les filtres depuis l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setFilters({
      type: urlParams.get('type') || null,
      warehouseId: urlParams.get('warehouseId') || null,
      search: urlParams.get('search') || null,
      expirationFrom: urlParams.get('expirationFrom') || null,
      expirationTo: urlParams.get('expirationTo') || null,
    })
  }, [])

  const applyFilters = () => {
    const params: Record<string, string> = {}
    
    if (filters.type) params.type = filters.type
    if (filters.warehouseId) params.warehouseId = filters.warehouseId
    if (filters.search) params.search = filters.search
    if (filters.expirationFrom) params.expirationFrom = filters.expirationFrom
    if (filters.expirationTo) params.expirationTo = filters.expirationTo

    router.get('/dashboard/products', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const resetFilters = () => {
    const emptyFilters: ProductFilters = {
      type: null,
      warehouseId: null,
      search: null,
      expirationFrom: null,
      expirationTo: null,
    }
    setFilters(emptyFilters)
    router.get('/dashboard/products', {}, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== null && value !== '')
  }

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
        <div className="flex items-center justify-end gap-2">
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
    <AdminLayout title="Produits & Services">
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ProductIcon className="h-6 w-6" />
            <span>Produits & Services ({products.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              color="secondary"
              onClick={() => setShowFilters(!showFilters)}
            />
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                label={'Nouveau produit | service'}
                onClick={() => {
                  setOpenAddModal(true)
                }}
              />
            </div>
          </div>
        </div>
        <hr />
        
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtre par date d'expiration (début) */}
              <div>
                <Input
                  label="Expiration à partir de"
                  type="date"
                  value={filters.expirationFrom || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, expirationFrom: e.target.value || null })
                  }
                />
              </div>

              {/* Filtre par date d'expiration (fin) */}
              <div>
                <Input
                  label="Expiration jusqu'à"
                  type="date"
                  value={filters.expirationTo || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, expirationTo: e.target.value || null })
                  }
                />
              </div>

              {/* Filtre par type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <SelectMenu
                  label="Sélectionner un type"
                  selected={productType.find(t => t.value === filters.type) || null}
                  data={productType}
                  getLabel={(item) => item?.name || ''}
                  getKey={(item) => item?.value || ''}
                  onSelected={(item) => setFilters({ ...filters, type: item?.value || null })}
                />
              </div>

              {/* Filtre par entrepôt */}
              <div>
                <label className="block text-sm font-medium mb-1">Emplacement</label>
                <SelectMenu
                  label="Sélectionner un emplacement"
                  selected={warehouses.find(w => w.id === filters.warehouseId) || null}
                  data={warehouses}
                  getLabel={(item) => item?.name || ''}
                  getKey={(item) => item?.id || ''}
                  onSelected={(item) => setFilters({ ...filters, warehouseId: item?.id || null })}
                />
              </div>

              {/* Filtre par recherche */}
              <div>
                <Input
                  label="Recherche (nom, référence)"
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || null })}
                  placeholder="Rechercher..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                label="Appliquer les filtres"
                onClick={applyFilters}
              />
              {hasActiveFilters() && (
                <Button
                  label="Réinitialiser"
                  color="secondary"
                  onClick={resetFilters}
                />
              )}
            </div>
          </div>
        )}

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
