import { Column, DataTable } from '~/components/data-table'
import AdminLayout from '../layouts/layout'
import Button from '~/components/button'
import { Link, router } from '@inertiajs/react'
import { ConfirmDialog } from '~/components/confirm-dialog'
import { useState } from 'react'

const people = [
  {
    reference: 'CUS-001',
    name: 'Lindsay Walton',
    email: 'deffomerlin@gmail.com',
    phone: '+237 655413392',
    description: 'Client fidèle depuis 2 ans',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-002',
    name: 'Michael Johnson',
    email: 'm.johnson@yahoo.com',
    phone: '+237 677889900',
    description: 'Client occasionnel',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-003',
    name: 'Sarah Chen',
    email: 's.chen@hotmail.com',
    phone: '+237 655112233',
    description: 'Nouveau client',
    district: 'Akwa',
  },
  {
    reference: 'CUS-004',
    name: 'David Muller',
    email: 'd.muller@gmail.com',
    phone: '+237 699887766',
    description: 'Client VIP',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-005',
    name: 'Emma Rodriguez',
    email: 'e.rodriguez@outlook.com',
    phone: '+237 655334455',
    description: 'Client régulier',
    district: 'Bonanjo',
  },
  {
    reference: 'CUS-006',
    name: 'James Wilson',
    email: 'j.wilson@gmail.com',
    phone: '+237 677556677',
    description: 'Client entreprise',
    district: 'Akwa',
  },
  {
    reference: 'CUS-007',
    name: 'Sophie Martin',
    email: 's.martin@yahoo.com',
    phone: '+237 655778899',
    description: 'Client particulier',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-008',
    name: 'Robert Kim',
    email: 'r.kim@gmail.com',
    phone: '+237 699001122',
    description: 'Client fidèle',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-009',
    name: 'Lisa Taylor',
    email: 'l.taylor@hotmail.com',
    phone: '+237 677334455',
    description: 'Nouveau client',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-010',
    name: 'Thomas Brown',
    email: 't.brown@outlook.com',
    phone: '+237 655667788',
    description: 'Client occasionnel',
    district: 'Bonanjo',
  },
  {
    reference: 'CUS-011',
    name: 'Maria Garcia',
    email: 'm.garcia@gmail.com',
    phone: '+237 699889900',
    description: 'Client VIP',
    district: 'Akwa',
  },
  {
    reference: 'CUS-012',
    name: 'Kevin Davis',
    email: 'k.davis@yahoo.com',
    phone: '+237 677112233',
    description: 'Client régulier',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-013',
    name: 'Jennifer Lee',
    email: 'j.lee@gmail.com',
    phone: '+237 655445566',
    description: 'Client entreprise',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-014',
    name: 'Daniel White',
    email: 'd.white@hotmail.com',
    phone: '+237 699778899',
    description: 'Client fidèle',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-015',
    name: 'Amanda Scott',
    email: 'a.scott@outlook.com',
    phone: '+237 677990011',
    description: 'Nouveau client',
    district: 'Bonanjo',
  },
  {
    reference: 'CUS-016',
    name: 'Christopher Hall',
    email: 'c.hall@gmail.com',
    phone: '+237 655223344',
    description: 'Client occasionnel',
    district: 'Akwa',
  },
  {
    reference: 'CUS-017',
    name: 'Michelle Young',
    email: 'm.young@yahoo.com',
    phone: '+237 699556677',
    description: 'Client régulier',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-018',
    name: 'Richard King',
    email: 'r.king@gmail.com',
    phone: '+237 677889922',
    description: 'Client VIP',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-019',
    name: 'Nicole Wright',
    email: 'n.wright@hotmail.com',
    phone: '+237 655112244',
    description: 'Client particulier',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-020',
    name: 'Brian Lopez',
    email: 'b.lopez@outlook.com',
    phone: '+237 699334466',
    description: 'Client fidèle',
    district: 'Bonanjo',
  },
  {
    reference: 'CUS-021',
    name: 'Jessica Hill',
    email: 'j.hill@gmail.com',
    phone: '+237 677556688',
    description: 'Nouveau client',
    district: 'Akwa',
  },
  {
    reference: 'CUS-022',
    name: 'Steven Green',
    email: 's.green@yahoo.com',
    phone: '+237 655778800',
    description: 'Client occasionnel',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-023',
    name: 'Rebecca Adams',
    email: 'r.adams@gmail.com',
    phone: '+237 699001133',
    description: 'Client régulier',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-024',
    name: 'Jason Nelson',
    email: 'j.nelson@hotmail.com',
    phone: '+237 677334466',
    description: 'Client entreprise',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-025',
    name: 'Melissa Carter',
    email: 'm.carter@outlook.com',
    phone: '+237 655667799',
    description: 'Client VIP',
    district: 'Bonanjo',
  },
  {
    reference: 'CUS-026',
    name: 'Eric Mitchell',
    email: 'e.mitchell@gmail.com',
    phone: '+237 699889911',
    description: 'Client fidèle',
    district: 'Akwa',
  },
  {
    reference: 'CUS-027',
    name: 'Kimberly Perez',
    email: 'k.perez@yahoo.com',
    phone: '+237 677112244',
    description: 'Nouveau client',
    district: 'Bonapriso',
  },
  {
    reference: 'CUS-028',
    name: 'Andrew Roberts',
    email: 'a.roberts@gmail.com',
    phone: '+237 655445577',
    description: 'Client occasionnel',
    district: 'Nkabang',
  },
  {
    reference: 'CUS-029',
    name: 'Stephanie Turner',
    email: 's.turner@hotmail.com',
    phone: '+237 699778800',
    description: 'Client régulier',
    district: 'Deïdo',
  },
  {
    reference: 'CUS-030',
    name: 'Matthew Phillips',
    email: 'm.phillips@outlook.com',
    phone: '+237 677990022',
    description: 'Client entreprise',
    district: 'Bonanjo',
  },
]

export default function Customers() {
  const [openConfirm, setOpenConfirm] = useState(false)

  const columnsMovement: Column<any>[] = [
    {
      Header: 'Réference',
      accessor: 'reference',
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
      Header: 'Quartier',
      accessor: 'district',
      sortable: false,
    },
    {
      Header: '',
      accessor: '#',
      sortable: false,
      render: () => (
        <div className="flex items-center justify-end gap-2 pr-2">
          <Button
            label=""
            color="info"
            onClick={() => router.visit(`/dashboard/customers/${1}/details`)}
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
            onClick={() => setOpenConfirm(true)}
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

  const handleConfirmDelete = () => {}

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
            <Button label={'Nouveau client'} />
          </div>
        </div>
        <div className="mt-8 flow-root">
          <DataTable columns={columnsMovement} data={people} itemsPerPage={50} withPaginate />
        </div>
      </div>
      <ConfirmDialog
        isOpen={openConfirm}
        setOpen={() => setOpenConfirm(!openConfirm)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  )
}
