import { isEmpty, isNil } from 'lodash'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { ProductResponse, WarehaouseResponse } from '~/pages/utils/entities'
import DialogModal from '~/components/dialog-modal'
import { useForm } from '@inertiajs/react'
import AutoComplete from '~/components/auto-complete'
import Input from '~/components/input'
import SelectMenu from '~/components/select-menu'
import { movementType } from '~/pages/utils/common'

interface CorrectStockDialogProps {
  product: ProductResponse
  warehaouseInfos: WarehaouseResponse | null
  warehouses: WarehaouseResponse[]
  openDialog: boolean
  openSource: boolean
  setOpenDialog: () => void
}

export default function CorrectStockDialog({
  product,
  warehaouseInfos,
  warehouses,
  openDialog,
  openSource,
  setOpenDialog,
}: CorrectStockDialogProps) {
  const { data, setData, post, processing, reset } = useForm({
    productId: product.id,
    quantity: '',
    title: `Correction du stock pour le produit ${product?.reference}`,
    type: '',
    unitPurchasePrice: product.sellingPrice,
    warehousesId: product.warehousesId,
    physicalQuantity: 0,
    virtualQuantity: 0,
  })

  const [type, setType] = useState<{
    value: string
    name: string
  } | null>()
  

  const [warehaouse, setWarehaouse] = useState<WarehaouseResponse | null>(
    !isNil(product?.warehouse) ? product.warehouse : null
  )

  const handleCorrectStock = async () => {
    post(`/dashboard/products/${product.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        toast.success('Opération réussie.')
        setOpenDialog()
      },
    })
  }

  return (
    <DialogModal
      title={'Corriger le stock'}
      open={openDialog}
      setOpen={setOpenDialog}
      size="xl"
      color={'warning'}
      handleConfirm={() => handleCorrectStock()}
      isLoading={processing}
      confirmTitle="Enregistrer"
    >
      <div className="flex flex-col justify-between h-full gap-4">
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Entrepôt:
            </label>
          </div>

          <AutoComplete<WarehaouseResponse>
            data={warehouses}
            selected={warehaouse!}
            disabled={openSource}
            getLabel={(value) => (!isNil(value) ? `${value!.reference!} >> ${value!.name!}` : '')}
            getKey={(value) => value!.id!}
            onSelected={(value) => {
              setData('warehousesId', value.id)
              setWarehaouse(value)
            }}
            label="Selectionner l'entrepôt"
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Nombre de pièces:
            </label>
          </div>
          <Input
            type="number"
            disabled={processing}
            defaultValue={data.quantity}
            onChange={(e) => setData('quantity', e.target.value)}
            placeholder=""
            block
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Type de mouvement:
            </label>
          </div>
          <SelectMenu<{
            value: string
            name: string
          }>
            data={movementType.filter((item) => item.name !== 'Origine')}
            getLabel={(value) => value!.name}
            getKey={(value) => value!.name}
            label="Selectionner..."
            selected={type!}
            onSelected={(value) => {
              setData('type', value.value)
              setType(value)
            }}
            className="w-full"
          />
        </div>

        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Prix d&apos;achat unitaire:
            </label>
          </div>
          <Input
            type="number"
            disabled={true}
            value={data.unitPurchasePrice!}
            onChange={(e) => setData('unitPurchasePrice', e.target.value)}
            placeholder=""
            block
          />
        </div>
        <div className="flex items-center">
          <div className="flex justify-start">
            <label className="block w-40 text-base font-normal leading-6 text-gray-text">
              Libellé du mouvement:
            </label>
          </div>
          <Input
            placeholder="Entrer le libellé"
            disabled={processing}
            value={data.title!}
            onChange={(e) => setData('title', e.target.value)}
            block
          />
        </div>
      </div>
    </DialogModal>
  )
}
