import { Column, DataTable } from '~/components/data-table'
import AdminLayout from '../layouts/layout'
import Button from '~/components/button'
import { useForm } from '@inertiajs/react'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { useState } from 'react'
import CreateCustomer from './components/create-customer'
import ThirdParties from '#models/third_parties'
import { toast } from 'react-toastify'

interface CustomersProps {
  customers: ThirdParties[]
}

export default function Customers({ customers }: CustomersProps) {
  const { delete: destroy, processing } = useForm()
  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)
  const [currentCustomer, setCurentCustomers] = useState<ThirdParties | null>()
  const [customerId, setCustomerId] = useState<string>('')

  const columnsMovement: Column<any>[] = [
    {
      Header: 'Réference',
      accessor: 'clientCode',
      sortable: false,
    },
    {
      Header: 'Nom complèt',
      accessor: 'name',
      sortable: false,
    },
    {
      Header: 'Email',
      accessor: 'email',
      sortable: false,
    },
    {
      Header: 'Téléphone',
      accessor: 'phone',
      sortable: false,
    },
    {
      Header: 'Description',
      accessor: 'description',
    },
    {
      Header: 'Adresse',
      accessor: 'address',
      sortable: false,
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
            onClick={() => {
              setCurentCustomers(data)
              setOpenAddModal(true)
            }}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          ></Button>
          <Button
            label=""
            color="danger"
            onClick={() => {
              setCustomerId(data.id)
              setOpenConfirm(true)
            }}
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
          />
        </div>
      ),
    },
  ]

  const handleConfirmDelete = () => {
    destroy(`/dashboard/customers?q=${customerId}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Suppréssion éffectuée...')
        setOpenConfirm(false)
      },
    })
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900 ">Clients</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the users in your account including their name, title, email and role.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              label={'Nouveau client'}
              onClick={() => {
                setCurentCustomers(null)
                setOpenAddModal(true)
              }}
            />
          </div>
        </div>
        <div className="mt-8 flow-root">
          <DataTable columns={columnsMovement} data={customers} itemsPerPage={50} withPaginate />
        </div>
      </div>
      <CreateCustomer
        currentCustomer={currentCustomer}
        openAddModal={openAddModal}
        handleOpenModal={() => setOpenAddModal(false)}
      />
      {customerId && (
        <ConfirmDialog
          isOpen={openConfirm}
          isLoading={processing}
          setOpen={() => setOpenConfirm(!openConfirm)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AdminLayout>
  )
}
