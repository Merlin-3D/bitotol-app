import ThirdParties from '#models/third_parties'
import { useForm } from '@inertiajs/react'
import classNames from 'classnames'
import { isEmpty, isNil } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AutoComplete from '~/components/auto-complete'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import { BillingStatus, billingType } from '~/pages/utils/common'
import { BillingResponse } from '~/pages/utils/entities'

interface CreateInvoiceProsp {
  thirdParties: ThirdParties[]
  currentInvoice?: BillingResponse | null
  openAddModal: boolean
  handleOpenModal: () => void
}

interface ErrorFieldsBilling {
  thirdPartiesId?: boolean
  type?: boolean
  billingDate?: boolean
}

export default function CreateInvoice({
  thirdParties,
  currentInvoice,
  openAddModal,
  handleOpenModal,
}: CreateInvoiceProsp) {
  const { data, setData, post, put, processing, reset } = useForm({
    type: billingType[0].value,
    thirdPartiesId: '',
    billingDate: '',
    description: '',
    status: BillingStatus.DRAFT,
  })

  useEffect(() => {
    const loadData = () => {
      setData('thirdPartiesId', currentInvoice?.thirdPartiesId!)
      setData('type', currentInvoice?.type!)
      setData('billingDate', currentInvoice?.billingDate!)
      setData('status', currentInvoice?.status! as any)
      setData('description', currentInvoice?.description!)
      setType(billingType.find((item) => item.value === currentInvoice?.type)!)
      setCustomer(thirdParties.find((item) => item.id === currentInvoice?.thirdPartiesId)!)
    }
    loadData()
  }, [currentInvoice])

  const [customer, setCustomer] = useState<ThirdParties>()
  const [type, setType] = useState<{
    value: string
    name: string
  } | null>(billingType[0])
  const [fieldErrorBilling, setFieldErrorBilling] = useState<ErrorFieldsBilling>()

  const fieldErrorBillingValidate = {
    type: type?.value,
    billingDate: data.billingDate,
    thirdPartiesId: data.thirdPartiesId,
  }

  const validateFields = () => {
    const errors: ErrorFieldsBilling = {}
    Object.keys(fieldErrorBillingValidate).forEach((key) => {
      if (isEmpty((fieldErrorBillingValidate as any)[key])) {
        errors[key as keyof ErrorFieldsBilling] = true
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrorBilling(errors)
      return false
    }
    setFieldErrorBilling({})

    return true
  }

  const handleConfirm = async () => {
    if (!validateFields()) {
      return
    }

    if (currentInvoice) {
      put(`/dashboard/billings/${currentInvoice.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Modification réussie.')
          handleOpenModal()
        },
      })
    } else {
      post('/dashboard/billings', {
        preserveScroll: true,
        onSuccess: () => {
          reset()
          toast.success('Opération réussie.')
          handleOpenModal()
        },
      })
    }
  }

  return (
    <DialogModal
      title={currentInvoice ? 'Modifier la facture' : 'Créer une facture'}
      confirmTitle={currentInvoice ? 'Modifier' : 'Créer brouillon'}
      open={openAddModal}
      setOpen={() => handleOpenModal()}
      handleConfirm={handleConfirm}
      size="4xl"
      color={currentInvoice ? 'warning' : 'primary'}
      isLoading={processing}
    >
      <div className="grid lg:grid-cols-1 gap-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                État.
              </label>
            </div>

            <span>
              {currentInvoice
                ? billingType.find((item) => item.value === currentInvoice?.type)!.name
                : 'Brouillon'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                Client <span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <AutoComplete<ThirdParties>
              data={thirdParties}
              selected={customer!}
              getLabel={(value) => (!isNil(value) ? value!.name! : '')}
              getKey={(value) => `${value!.id!}`}
              onSelected={(value) => {
                setData('thirdPartiesId', value.id)
                setCustomer(value)
              }}
              label="Selectionner un tiers"
              error={fieldErrorBilling?.thirdPartiesId}
            />
          </div>
        </div>

        {/* {!billing?.isFullRefund && ( */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                Type<span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <SelectMenu<{
              value: string
              name: string
            }>
              data={
                currentInvoice?.type === 'CI'
                  ? [
                      {
                        name: 'Facture avoir',
                        value: 'CI', //Credit Invoice
                        invoice: 'Facture avoir',
                      },
                    ]
                  : billingType.slice(0, 2)
              }
              getLabel={(value) => value!.name}
              getKey={(value) => value!.name}
              label="Selectionner..."
              selected={type!}
              onSelected={(value) => {
                setData('type', value.value)
                setType(value)
              }}
              className="w-full"
              error={fieldErrorBilling?.type!}
            />
          </div>
        </div>
        {/* )} */}

        <div className="flex flex-col gap-4">
          <div className="flex items-start">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                Date facturation
                <span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <Input
              type="date"
              disabled={processing}
              value={data.billingDate}
              onChange={(e) => setData('billingDate', e.target.value)}
              block
              error={fieldErrorBilling?.billingDate!}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
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
      </div>
    </DialogModal>
  )
}
