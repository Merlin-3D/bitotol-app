import { router, useForm } from '@inertiajs/react'
import { isEmpty, isNil } from 'lodash'
import { useState } from 'react'
import { toast } from 'react-toastify'
import AutoComplete from '~/components/auto-complete'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'
import { BillingResponse, ProductResponse } from '~/pages/utils/entities'

interface ErrorFieldsProduct {
  product?: boolean
  qty?: boolean
}

interface AddProductDialogProps {
  billing: BillingResponse
  products: ProductResponse[]
  openModalProduct: boolean
  handleOpenModal: () => void
}

export default function AddProductDialog({
  billing,
  products,
  openModalProduct,
  handleOpenModal,
}: AddProductDialogProps) {
  const { data, setData, post, processing, reset } = useForm({
    thirdPartiesId: billing.thirdPartiesId!,
    billingsId: billing.id,
    productId: '',
    tva: '',
    quantity: '',
    discount: '',
    price: '',
  })
  const [product, setProduct] = useState<ProductResponse | null>()
  const [fieldErrorProduct, setFieldErrorProduct] = useState<ErrorFieldsProduct>()

  const fieldErrorProductValidate = {
    product: product?.id,
    qty: data.quantity,
  }

  const validateFields = () => {
    const errors: ErrorFieldsProduct = {}
    Object.keys(fieldErrorProductValidate).forEach((key) => {
      if (isEmpty((fieldErrorProductValidate as any)[key])) {
        errors[key as keyof ErrorFieldsProduct] = true
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrorProduct(errors)
      return false
    }
    setFieldErrorProduct({})

    return true
  }

  const handleAddItem = async () => {
    if (!validateFields()) {
      return
    }
    post(`/dashboard/billings/${billing.id}`, {
      preserveScroll: true,
      onSuccess: (data: any) => {
        if (data.props.message) {
          toast.warning(data.props.message)
        } else {
          reset()
          setProduct(null)
          toast.success('Opération réussie.')
          handleOpenModal()
          router.visit(`/dashboard/billings/${billing.id}`)
        }
      },
    })
  }

  return (
    <DialogModal
      title={'Ajouter un produit | service'}
      open={openModalProduct}
      setOpen={() => handleOpenModal()}
      size="3xl"
      confirmTitle={'Enregistrer'}
      handleConfirm={() => handleAddItem()}
      isLoading={processing}
      color={'warning'}
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Produit | Service
              <span className="text-xs text-red-600">*</span>
            </label>
          </div>

          <AutoComplete<ProductResponse>
            data={products}
            selected={product!}
            getLabel={(value) => (!isNil(value) ? `${value!.reference!} - ${value!.name!}` : '')}
            getKey={(value) => `${value!.id!}`}
            onSelected={(value) => {
              setData('tva', '')
              setData('price', value.sellingPrice)
              setData('discount', '')
              setData('productId', value.id)
              setProduct(value)
            }}
            label={'Selectionner le produit | service'}
            error={fieldErrorProduct?.product}
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Quantité<span className="text-xs text-red-600">*</span>
            </label>
          </div>

          <Input
            type="number"
            placeholder="Entrer la quantité"
            disabled={processing}
            value={data.quantity!}
            onChange={(e) => setData('quantity', e.target.value)}
            error={fieldErrorProduct?.qty}
            block
          />
        </div>
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Prix unitaire
            </label>
          </div>

          <Input
            type="number"
            placeholder="Entrer le prix unitaire"
            disabled={processing}
            value={data.price!}
            onChange={(e) => setData('price', e.target.value)}
            block
          />
        </div>
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Remise
            </label>
          </div>

          <Input
            type="number"
            placeholder="Entrer la remise"
            disabled={processing}
            value={data.discount!}
            onChange={(e) => setData('discount', e.target.value)}
            block
          />
        </div>
      </div>
    </DialogModal>
  )
}
