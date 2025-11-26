import AdminLayout from '../layouts/layout'
import { Column, DataTable } from '~/components/data-table'
import { formatDateTime, formatNumber } from '../utils/common'
import Button from '~/components/button'
import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import Stock from '#models/stock'
import Product from '#models/product'
import Warehouses from '#models/warehouses'
import InventoryIcon from '~/components/icons/inventory.icon'

interface InventoryItem {
  id: string
  productId: string
  warehousesId: string
  product: Product
  warehouse: Warehouses
  physicalQuantity: number
  virtualQuantity: number
  unitPurchasePrice: number
  createdAt: string
  updatedAt: string
}

interface InventoryProps {
  inventory: InventoryItem[]
  warehouses: Warehouses[]
}

interface InventoryFilters {
  dateFrom: string | null
  dateTo: string | null
  warehouseId: string | null
}

export default function Inventory({ inventory, warehouses }: InventoryProps) {
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filters, setFilters] = useState<InventoryFilters>({
    dateFrom: null,
    dateTo: null,
    warehouseId: null,
  })

  // Récupérer les filtres depuis l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setFilters({
      dateFrom: urlParams.get('dateFrom') || null,
      dateTo: urlParams.get('dateTo') || null,
      warehouseId: urlParams.get('warehouseId') || null,
    })
  }, [])

  const applyFilters = () => {
    const params: Record<string, string> = {}
    
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    if (filters.warehouseId) params.warehouseId = filters.warehouseId

    router.get('/dashboard/inventory', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const resetFilters = () => {
    const emptyFilters: InventoryFilters = {
      dateFrom: null,
      dateTo: null,
      warehouseId: null,
    }
    setFilters(emptyFilters)
    router.get('/dashboard/inventory', {}, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== null && value !== '')
  }

  const columns: Column<InventoryItem>[] = [
    {
      Header: 'Produit',
      accessor: 'product',
      sortable: false,
      render: (data) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{data.product?.name || 'N/A'}</span>
          {data.product?.reference && (
            <span className="text-gray-500 text-sm">({data.product.reference})</span>
          )}
        </div>
      ),
    },
    {
      Header: 'Emplacement',
      accessor: 'warehouse',
      sortable: false,
      render: (data) => <span>{data.warehouse?.name || 'N/A'}</span>,
    },
    {
      Header: 'Quantité physique',
      accessor: 'physicalQuantity',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          <span className="font-medium">{formatNumber(data.physicalQuantity)}</span>
        </div>
      ),
    },
    {
      Header: 'Quantité virtuelle',
      accessor: 'virtualQuantity',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          <span className="font-medium">{formatNumber(data.virtualQuantity)}</span>
        </div>
      ),
    },
    {
      Header: 'Prix unitaire',
      accessor: 'unitPurchasePrice',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          <span>{formatNumber(data.unitPurchasePrice)} FCFA</span>
        </div>
      ),
    },
    {
      Header: 'Valeur totale',
      accessor: 'total',
      sortable: false,
      render: (data) => {
        const totalValue = data.physicalQuantity * data.unitPurchasePrice
        return (
          <div className="text-right">
            <span className="font-semibold">{formatNumber(totalValue)} FCFA</span>
          </div>
        )
      },
    },
    {
      Header: 'Date de création',
      accessor: 'createdAt',
      render: (data) => <span>{formatDateTime(data.createdAt!, true)}</span>,
      sortable: true,
    },
  ]

  // Calculer les totaux
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.physicalQuantity * item.unitPurchasePrice,
    0
  )
  const totalPhysicalQuantity = inventory.reduce(
    (sum, item) => sum + item.physicalQuantity,
    0
  )

  return (
    <AdminLayout title="Inventaire">
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <InventoryIcon className="h-6 w-6" />
            <span>Inventaire des produits ({inventory.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              color="secondary"
              onClick={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>
        <hr />

        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtre par date de début */}
              <div>
                <Input
                  label="Date de début"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || null })}
                />
              </div>

              {/* Filtre par date de fin */}
              <div>
                <Input
                  label="Date de fin"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
                />
              </div>

              {/* Filtre par emplacement */}
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

        {/* Résumé */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre d'articles</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantité totale physique</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(totalPhysicalQuantity)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valeur totale</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatNumber(totalValue)} FCFA
              </p>
            </div>
          </div>
        </div>

        <DataTable<InventoryItem> columns={columns} data={inventory} withPaginate />
      </div>
    </AdminLayout>
  )
}

