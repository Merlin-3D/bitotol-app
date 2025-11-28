import { EyeIcon, InvoiceIcon, DownloadIcon } from '~/components/icons'
import AdminLayout from '../layouts/layout'
import { BillingResponse } from '../utils/entities'
import Button from '~/components/button'
import { Column, DataTable } from '~/components/data-table'
import { useState, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import { billingStatus, formatDateTime, billingType, formatNumber } from '../utils/common'
import Badge from '~/components/badge'
import CreateInvoice from './components/create-billing'
import ThirdParties from '#models/third_parties'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import AutoComplete from '~/components/auto-complete'

interface BillingsProps {
  billings: BillingResponse[]
  customers: ThirdParties[]
}

interface Filters {
  status: string | null
  customerId: string | null
  type: string | null
  dateFrom: string | null
  dateTo: string | null
  amountMin: string | null
  amountMax: string | null
  reference: string | null
}

export default function Billings({ customers, billings }: BillingsProps) {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filters, setFilters] = useState<Filters>({
    status: null,
    customerId: null,
    type: null,
    dateFrom: null,
    dateTo: null,
    amountMin: null,
    amountMax: null,
    reference: null,
  })

  // Récupérer les filtres depuis l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setFilters({
      status: urlParams.get('status') || null,
      customerId: urlParams.get('customerId') || null,
      type: urlParams.get('type') || null,
      dateFrom: urlParams.get('dateFrom') || null,
      dateTo: urlParams.get('dateTo') || null,
      amountMin: urlParams.get('amountMin') || null,
      amountMax: urlParams.get('amountMax') || null,
      reference: urlParams.get('reference') || null,
    })
  }, [])

  const applyFilters = () => {
    const params: Record<string, string> = {}

    if (filters.status) params.status = filters.status
    if (filters.customerId) params.customerId = filters.customerId
    if (filters.type) params.type = filters.type
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    if (filters.amountMin) params.amountMin = filters.amountMin
    if (filters.amountMax) params.amountMax = filters.amountMax
    if (filters.reference) params.reference = filters.reference

    router.get('/dashboard/billings', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const resetFilters = () => {
    const emptyFilters: Filters = {
      status: null,
      customerId: null,
      type: null,
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
      reference: null,
    }
    setFilters(emptyFilters)
    router.get(
      '/dashboard/billings',
      {},
      {
        preserveState: true,
        preserveScroll: true,
      }
    )
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== null && value !== '')
  }

  const downloadPdf = () => {
    const params: Record<string, string> = {}

    if (filters.status) params.status = filters.status
    if (filters.customerId) params.customerId = filters.customerId
    if (filters.type) params.type = filters.type
    if (filters.dateFrom) params.dateFrom = filters.dateFrom
    if (filters.dateTo) params.dateTo = filters.dateTo
    if (filters.amountMin) params.amountMin = filters.amountMin
    if (filters.amountMax) params.amountMax = filters.amountMax
    if (filters.reference) params.reference = filters.reference

    const queryString = new URLSearchParams(params).toString()
    window.open(`/dashboard/billings/export-pdf?${queryString}`, '_blank')
  }
  const columns: Column<BillingResponse>[] = [
    {
      Header: 'Réf. facture',
      accessor: 'code',
      render: (data) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/billings/${data.id}`} className=" text-blue-500 hover:underline">
            {data.code}
          </Link>
        </div>
      ),
      sortable: false,
    },
    {
      Header: 'Clients',
      accessor: 'thirdparties',
      sortable: false,
      render: (data) => <div className="flex items-center gap-2">{data.thirdParties?.name!}</div>,
    },
    {
      Header: 'Date de la facturation',
      accessor: 'billingDate',
      render: (data) => <span>{formatDateTime(data.billingDate!, false)}</span>,
      sortable: true,
    },
    {
      Header: 'Montant TTC',
      accessor: 'amountExcludingVat',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          <span>{`${formatNumber(Number(data.amountIncludingVat))} FCFA`}</span>
        </div>
      ),
    },
    {
      Header: 'Reste à payer',
      accessor: 'amountExcludingVat',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          <span>{`${formatNumber(Number(data.remainingPrice))} FCFA`}</span>
        </div>
      ),
    },
    {
      Header: 'État',
      accessor: 'status',
      sortable: false,
      width: 200,
      render: (data) => (
        <div className="flex items-start">
          <Badge
            type={billingStatus.find((item) => item.status === data.status)?.type! as any}
            text={billingStatus.find((item) => item.status === data.status)?.name!}
          />
        </div>
      ),
    },
    {
      Header: 'Date de création',
      accessor: 'createdAt',
      render: (data) => <span>{formatDateTime(data.createdAt!, true)}</span>,
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
            onClick={() => router.visit(`/dashboard/billings/${data.id}`)}
            icon={<EyeIcon className="h-4 w-4" />}
          ></Button>
        </div>
      ),
    },
  ]

  return (
    <AdminLayout title="Factures">
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <InvoiceIcon className="h-6 w-6" />
            <span>Factures ({billings.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              label={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
              color="secondary"
              onClick={() => setShowFilters(!showFilters)}
            />
            <Button
              label="Télécharger PDF"
              color="info"
              onClick={downloadPdf}
              icon={<DownloadIcon className="h-4 w-4" />}
            />
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Button
                label={'Nouvelle facture'}
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
              {/* Filtre par référence */}
              <div>
                <Input
                  label="Réf. facture"
                  type="text"
                  value={filters.reference || ''}
                  onChange={(e) => setFilters({ ...filters, reference: e.target.value || null })}
                  placeholder="EX: FAC/0125"
                />
              </div>

              {/* Filtre par statut */}
              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <SelectMenu
                  label="Sélectionner un statut"
                  selected={billingStatus.find((s) => s.status === filters.status) || null}
                  data={billingStatus}
                  getLabel={(item) => item?.name || ''}
                  getKey={(item) => item?.status || ''}
                  onSelected={(item) => setFilters({ ...filters, status: item?.status || null })}
                />
              </div>

              {/* Filtre par client */}
              <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <AutoComplete<ThirdParties>
                  data={customers}
                  selected={customers.find((c) => c.id === filters.customerId)!}
                  getLabel={(item) => item?.name || ''}
                  getKey={(value) => `${value!.id!}`}
                  onSelected={(item) => setFilters({ ...filters, customerId: item?.id || null })}
                  label="Sélectionner un client"
                />
              </div>

              {/* Filtre par type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type de facture</label>
                <SelectMenu
                  label="Sélectionner un type"
                  selected={billingType.find((t) => t.value === filters.type) || null}
                  data={billingType}
                  getLabel={(item) => item?.name || ''}
                  getKey={(item) => item?.value || ''}
                  onSelected={(item) => setFilters({ ...filters, type: item?.value || null })}
                />
              </div>

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

              {/* Filtre par montant minimum */}
              <div>
                <Input
                  label="Montant minimum (FCFA)"
                  type="number"
                  value={filters.amountMin || ''}
                  onChange={(e) => setFilters({ ...filters, amountMin: e.target.value || null })}
                  placeholder="0"
                />
              </div>

              {/* Filtre par montant maximum */}
              <div>
                <Input
                  label="Montant maximum (FCFA)"
                  type="number"
                  value={filters.amountMax || ''}
                  onChange={(e) => setFilters({ ...filters, amountMax: e.target.value || null })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button label="Appliquer les filtres" onClick={applyFilters} />
              {hasActiveFilters() && (
                <Button label="Réinitialiser" color="secondary" onClick={resetFilters} />
              )}
            </div>
          </div>
        )}

        <DataTable<BillingResponse> columns={columns} data={billings} withPaginate />
      </div>

      <CreateInvoice
        thirdParties={customers}
        openAddModal={openAddModal}
        handleOpenModal={() => setOpenAddModal(false)}
      />
    </AdminLayout>
  )
}
