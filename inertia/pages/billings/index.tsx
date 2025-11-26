import { EyeIcon, InvoiceIcon } from '~/components/icons'
import AdminLayout from '../layouts/layout'
import { BillingResponse } from '../utils/entities'
import Button from '~/components/button'
import { Column, DataTable } from '~/components/data-table'
import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { billingStatus, formatDateTime } from '../utils/common'
import Badge from '~/components/badge'
import CreateInvoice from './components/create-billing'
import ThirdParties from '#models/third_parties'

interface BillingsProps {
  billings: BillingResponse[]
  customers: ThirdParties[]
}

export default function Billings({ customers, billings }: BillingsProps) {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)
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
          <span>{`${data.amountIncludingVat} FCFA`}</span>
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
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              label={'Nouvelle facture'}
              onClick={() => {
                setOpenAddModal(true)
              }}
            />
          </div>
        </div>
        <hr />
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
