import { useForm } from '@inertiajs/react'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'
import { WarehaouseResponse } from '~/pages/utils/entities'

interface ErrorFieldsWarehouse {
  name?: boolean
}

interface CreateWarehouseProps {
  currentWarehouse?: WarehaouseResponse | null
  openAddModal: boolean
  handleOpenModlal: () => void
}

export default function CreateWarehouse({
  currentWarehouse,
  openAddModal,
  handleOpenModlal,
}: CreateWarehouseProps) {
  const { data, setData, post, put, processing, reset } = useForm({
    name: '',
    address: '',
    phone: '',
    description: '',
  })

  const [fieldErrorWarehouse, setFieldErrorWarehouse] = useState<ErrorFieldsWarehouse>()

  const fieldErrorWarehouseValidate = {
    name: data.name,
  }

  const validateFields = () => {
    const errors: ErrorFieldsWarehouse = {}
    Object.keys(fieldErrorWarehouseValidate).forEach((key) => {
      if (isEmpty((fieldErrorWarehouseValidate as any)[key])) {
        errors[key as keyof ErrorFieldsWarehouse] = true
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrorWarehouse(errors)
      return false
    }
    setFieldErrorWarehouse({})

    return true
  }

  const handleConfirm = async () => {
    if (!validateFields()) {
      return
    }

    if (currentWarehouse) {
      put(`/dashboard/warehouses/${currentWarehouse.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Modification réussie.')
          handleOpenModlal()
        },
      })
    } else {
      post('/dashboard/warehouses', {
        preserveScroll: true,
        onSuccess: () => {
          reset()
          toast.success('Opération réussie.')
          handleOpenModlal()
        },
      })
    }
  }

  useEffect(() => {
    const loadData = () => {
      setData('name', currentWarehouse?.name!)
      setData('phone', currentWarehouse?.phone!)
      setData('address', currentWarehouse?.address!)
      setData('description', currentWarehouse?.description!)
    }
    loadData()
  }, [currentWarehouse])

  return (
    <DialogModal
      title={currentWarehouse ? 'Modifier un entrepôt' : 'Ajouter un entrepôt'}
      confirmTitle={currentWarehouse ? 'Modifier' : 'Ajouter'}
      open={openAddModal}
      setOpen={() => handleOpenModlal()}
      handleConfirm={handleConfirm}
      size="4xl"
      color={currentWarehouse ? 'warning' : 'primary'}
      isLoading={processing}
    >
      <div className="grid lg:grid-cols-1 gap-4 w-full">
        <div className="flex items-center ">
          <div className="flex justify-start">
            <label className="block w-60 text-base font-normal leading-6 text-gray-text">
              Nom de l&apos;emplacement
              <span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <Input
            placeholder="Non de l'emplacement"
            disabled={processing}
            value={data?.name}
            onChange={(e) => setData('name', e.target.value)}
            error={fieldErrorWarehouse?.name}
            block={true}
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-60 text-base font-normal leading-6 text-gray-text">
              Téléphpone
            </label>
          </div>
          <Input
            type="number"
            placeholder="Téléphone"
            disabled={processing}
            value={data?.phone}
            onChange={(e) => setData('phone', e.target.value)}
            block={true}
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-60 text-base font-normal leading-6 text-gray-text">
              Adresse
            </label>
          </div>
          <Input
            placeholder="Entrer l'adresse"
            disabled={processing}
            value={data?.address}
            onChange={(e) => setData('address', e.target.value)}
            block={true}
          />
        </div>

        <div className="flex items-start ">
          <div className="flex justify-center">
            <label className="block w-60 text-base font-normal leading-6 text-gray-text">
              Description
            </label>
          </div>
          <textarea
            name=""
            id=""
            placeholder="Entrer une description"
            cols={10}
            rows={4}
            disabled={processing}
            value={data?.description}
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
