import { Column, DataTable } from '~/components/data-table'
import AdminLayout from '../layouts/layout'
import Button from '~/components/button'
import { useForm, router } from '@inertiajs/react'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { useState, useEffect } from 'react'
import CreateCustomer from './components/create-customer'
import ThirdParties from '#models/third_parties'
import { toast } from 'react-toastify'
import CustomerIcon from '~/components/icons/customers.icon'
import Input from '~/components/input'

interface CustomersProps {
  customers: ThirdParties[]
}

export default function Customers({ customers }: CustomersProps) {
  const { delete: destroy, processing } = useForm()
  const [openConfirm, setOpenConfirm] = useState<boolean>(false)
  const [openAddModal, setOpenAddModal] = useState<boolean>(false)
  const [currentCustomer, setCurentCustomers] = useState<ThirdParties | null>()
  const [customerId, setCustomerId] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  // Récupérer la recherche depuis l'URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setSearch(urlParams.get('search') || '')
  }, [])

  const handleSearch = () => {
    const params: Record<string, string> = {}
    if (search) params.search = search

    router.get('/dashboard/customers', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

  const handleResetSearch = () => {
    setSearch('')
    router.get('/dashboard/customers', {}, {
      preserveState: true,
      preserveScroll: true,
    })
  }

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
      <div className="flex flex-col gap-3 bg-white px-4 h-full py-6 rounded-2xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CustomerIcon className="h-6 w-6" />
            <span>Clients</span>
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
        <hr />
        
        {/* Champ de recherche */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              label=""
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="Rechercher par nom, référence, email, téléphone..."
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              label="Rechercher"
              onClick={handleSearch}
              color="warning"
            />
            {search && (
              <Button
                label="Réinitialiser"
                onClick={handleResetSearch}
                color="secondary"
              />
            )}
          </div>
        </div>

        <DataTable columns={columnsMovement} data={customers} itemsPerPage={50} withPaginate />
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
