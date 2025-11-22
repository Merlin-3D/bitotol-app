import ThirdParties from '#models/third_parties'
import { useForm } from '@inertiajs/react'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'

interface ErrorFieldsCustomers {
  name?: boolean
  phone?: boolean
  address?: boolean
}

interface CreateCustomerProps {
  currentCustomer?: ThirdParties | null
  openAddModal: boolean
  handleOpenModlal: () => void
}

export default function CreateCustomer({
  currentCustomer,
  openAddModal,
  handleOpenModlal,
}: CreateCustomerProps) {
  const { data, setData, post, put, processing, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  })

  const [fieldErrorCustomers, setFieldErrorCustomers] = useState<ErrorFieldsCustomers>()

  const fieldErrorTiersValidate = {
    name: data.name,
    phone: data.phone,
    address: data.address,
  }

  const validateFields = () => {
    const errors: ErrorFieldsCustomers = {}
    Object.keys(fieldErrorTiersValidate).forEach((key) => {
      if (isEmpty((fieldErrorTiersValidate as any)[key])) {
        errors[key as keyof ErrorFieldsCustomers] = true
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrorCustomers(errors)
      return false
    }
    setFieldErrorCustomers({})

    return true
  }

  const handleConfirm = async () => {
    if (!validateFields()) {
      return
    }
    if (currentCustomer) {
      put(`/dashboard/customers?q=${currentCustomer.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Modification réussie.')
          handleOpenModlal()
        },
      })
    } else {
      post('/dashboard/customers', {
        preserveScroll: true,
        onSuccess: () => {
          reset()
          toast.success('Opération réussie.')
          handleOpenModlal()
        },
      })
    }

    setData('name', '')
    setData('email', '')
    setData('phone', '')
    setData('address', '')
    setData('description', '')
  }

  useEffect(() => {
    const loadData = () => {
      setData('name', currentCustomer?.name!)
      setData('email', currentCustomer?.email!)
      setData('phone', currentCustomer?.phone!)
      setData('address', currentCustomer?.address!)
      setData('description', currentCustomer?.description!)
    }
    loadData()
  }, [currentCustomer])

  return (
    <DialogModal
      title={currentCustomer ? 'Modifier un client' : 'Ajouter un client'}
      confirmTitle={currentCustomer ? 'Modifier' : 'Ajouter'}
      open={openAddModal}
      setOpen={() => handleOpenModlal()}
      handleConfirm={handleConfirm}
      size="4xl"
      color={currentCustomer ? 'info' : 'primary'}
      isLoading={processing}
    >
      <div className="grid lg:grid-cols-1 gap-4 w-full">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                Nom <span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <Input
              placeholder="Entrer le nom"
              disabled={processing}
              value={data?.name}
              onChange={(e) => setData('name', e.target.value)}
              block={true}
              error={fieldErrorCustomers?.name}
            />
          </div>
        </div>

        <div className="flex items-center col-span-1">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Email
            </label>
          </div>
          <Input
            placeholder="Entrer l'email"
            type="email"
            disabled={processing}
            value={data?.email}
            onChange={(e) => setData('email', e.target.value)}
            block={true}
          />
        </div>

        <div className="flex items-center col-span-1">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Téléphone <span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <Input
            type="number"
            disabled={processing}
            value={data?.phone}
            onChange={(e) => setData('phone', e.target.value)}
            placeholder="Téléphone"
            block={true}
            error={fieldErrorCustomers?.phone}
          />
        </div>

        <div className="flex items-center col-span-1">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Adresse <span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <Input
            type="text"
            disabled={processing}
            value={data?.address}
            onChange={(e) => setData('address', e.target.value)}
            placeholder="Entrer l'adresse"
            block={true}
            error={fieldErrorCustomers?.address}
          />
        </div>
        <div className="flex items-start col-span-1">
          <div className="flex justify-center">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Description
            </label>
          </div>
          <textarea
            name=""
            id=""
            placeholder="Entrer une description"
            cols={10}
            rows={4}
            value={data?.description}
            disabled={processing}
            onChange={(e) => setData('description', e.target.value)}
            className={classNames(
              'focus:outline-green-700 focus:ring-green-700 block w-full rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-sub-heading/80 placeholder:font-light focus:ring-1  focus:ring-inset sm:text-sm sm:leading-6'
            )}
          ></textarea>
        </div>
      </div>
    </DialogModal>
  )
}
