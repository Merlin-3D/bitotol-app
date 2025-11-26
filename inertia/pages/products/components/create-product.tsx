import { ProductType } from '#models/enum/product_enum'
import { useForm } from '@inertiajs/react'
import classNames from 'classnames'
import { isEmpty, isNil } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import AutoComplete from '~/components/auto-complete'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import { productType } from '~/pages/utils/common'
import { ProductResponse, WarehaouseResponse } from '~/pages/utils/entities'

interface ErrorFieldsProduct {
  type?: boolean
  name?: boolean
  warehouse?: boolean
  sellingPrice?: boolean
}

interface CreateProductProsp {
  warehouses: WarehaouseResponse[]
  currentProduct?: ProductResponse | null
  openAddModal: boolean
  handleOpenModal: () => void
}

export default function CreateProduct({
  warehouses,
  currentProduct,
  openAddModal,
  handleOpenModal,
}: CreateProductProsp) {
  const { data, setData, post, put, processing, reset } = useForm({
    name: '',
    warehousesId: '',
    active: true,
    type: '',
    description: '',
    limitStockAlert: '',
    optimalStock: '',
    sellingPrice: '',
    expiredAt: '',
  })

  const [type, setType] = useState<{
    value: string
    name: string
  }>()

  const [warehouse, setWarehouse] = useState<WarehaouseResponse>()

  useEffect(() => {
    const loadData = () => {
      setData('name', currentProduct?.name!)
      setData('warehousesId', currentProduct?.warehousesId!)
      setData('active', currentProduct?.active!)
      setData('type', currentProduct?.type!)
      setData('limitStockAlert', currentProduct?.limitStockAlert!)
      setData('optimalStock', currentProduct?.optimalStock!)
      setData('sellingPrice', currentProduct?.sellingPrice!)
      setData('expiredAt', currentProduct?.expiredAt!)
      setData('description', currentProduct?.description!)
      setType(productType.find((item) => item.value === currentProduct?.type))
      setWarehouse(warehouses.find((item) => item.id === currentProduct?.warehousesId))
    }
    loadData()
  }, [currentProduct])

  const [fieldErrorProduct, setFieldErrorProduct] = useState<ErrorFieldsProduct>()

  const fieldErrorProductValidate =
    type?.value === 'S'
      ? {
          type: data.type,
          name: data.name,
          sellingPrice: `${data.sellingPrice}`,
        }
      : {
          type: data.type,
          name: data.name,
          sellingPrice: data.sellingPrice,
          warehouse: warehouse?.id,
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

  const handleConfirm = async () => {
    if (!validateFields()) {
      return
    }

    if (currentProduct) {
      put(`/dashboard/products/${currentProduct.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Modification réussie.')
          handleOpenModal()
        },
      })
    } else {
      post('/dashboard/products', {
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
      title={currentProduct ? 'Modifier un produit | service' : 'Ajouter un produit | service'}
      confirmTitle={currentProduct ? 'Modifier' : 'Ajouter'}
      open={openAddModal}
      setOpen={() => handleOpenModal()}
      handleConfirm={handleConfirm}
      size="4xl"
      color={currentProduct ? 'info' : 'primary'}
      isLoading={processing}
    >
      <div className="grid lg:grid-cols-1 gap-4 w-full">
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Type<span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <SelectMenu<{
            value: string
            name: string
          }>
            data={
              currentProduct
                ? productType.filter((item) => item.value === currentProduct.type)
                : productType
            }
            getLabel={(value) => value!.name}
            getKey={(value) => value!.value}
            label="Selectionner..."
            selected={type}
            onSelected={(value) => {
              setData('type', value.value)
              setType(value)
            }}
            className="w-full"
            error={fieldErrorProduct?.type}
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Libellé<span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <Input
            placeholder="Entrer le libellé"
            disabled={processing}
            value={data?.name}
            onChange={(e) => setData('name', e.target.value)}
            error={fieldErrorProduct?.name}
            block
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Prix de vente<span className="text-xs text-red-600">*</span>
            </label>
          </div>
          <Input
            type="number"
            disabled={processing}
            value={data?.sellingPrice!}
            onChange={(e) => setData('sellingPrice', e.target.value)}
            placeholder="Entrer le prix de vente"
            error={fieldErrorProduct?.sellingPrice}
            block
          />
        </div>

        {type?.value === ProductType.PRODUCT && (
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                Emplacement<span className="text-xs text-red-600">*</span>
              </label>
            </div>

            <AutoComplete<WarehaouseResponse>
              data={warehouses}
              selected={warehouse!}
              getLabel={(value) => (!isNil(value) ? `${value!.reference!} >> ${value!.name!}` : '')}
              getKey={(value) => value!.id!}
              onSelected={(value) => {
                setData('warehousesId', value.id)
                setWarehouse(value)
              }}
              label="Selectionner l'emplacement"
              error={fieldErrorProduct?.warehouse}
            />
          </div>
        )}

        {type?.value === ProductType.PRODUCT && (
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                Limite stock pour alerte
              </label>
            </div>
            <Input
              type="number"
              disabled={processing}
              placeholder="Limite stock pour alerte"
              value={data?.limitStockAlert!}
              onChange={(e) => setData('limitStockAlert', e.target.value)}
              block
            />
          </div>
        )}

        {type?.value === ProductType.PRODUCT && (
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                Stock dêsiré optimal
              </label>
            </div>
            <Input
              type="number"
              disabled={processing}
              value={data?.optimalStock!}
              onChange={(e) => setData('optimalStock', e.target.value)}
              placeholder="Stock dêsiré optimal"
              block
            />
          </div>
        )}

        {type?.value === ProductType.PRODUCT && (
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                Date d&apos;expiration
              </label>
            </div>
            <Input
              type="date"
              placeholder="Choisir la date"
              disabled={processing}
              value={data?.expiredAt!}
              onChange={(e) => setData('expiredAt', e.target.value)}
              block
            />
          </div>
        )}

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
              'ocus:outline-green-700 focus:ring-green-700 block w-full rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-sub-heading/80 placeholder:font-light focus:ring-1  focus:ring-inset sm:text-sm sm:leading-6'
            )}
          ></textarea>
        </div>
      </div>
    </DialogModal>
  )
}
