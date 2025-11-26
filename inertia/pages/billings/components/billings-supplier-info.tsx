import BillingsSupplierHeader from './billings-supplier-header'
import _, { isEmpty, isNil, isUndefined } from 'lodash'
import classNames from 'classnames'
import { Switch } from '@headlessui/react'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'
import {
  BillingItem,
  BillingPayment,
  BillingResponse,
  ProductResponse,
} from '~/pages/utils/entities'
import { Column, DataTable } from '~/components/data-table'
import { ProductType } from '#models/enum/product_enum'
import { EditIcon, InvoiceIcon, RemoveIcon, TrashIcon } from '~/components/icons'
import { Link, router, useForm, usePage } from '@inertiajs/react'
import {
  billingStatus,
  BillingStatus,
  billingType,
  formatDateTime,
  formatNumber,
} from '~/pages/utils/common'
import { ConfirmDialog } from '~/components/confirm-dialog'
import Badge from '~/components/badge'
import Button from '~/components/button'
import { ConfirmOrderDialog } from '~/components/confirm-order-dialog'
import DialogModal from '~/components/dialog-modal'
import Input from '~/components/input'
import { UserIcon } from '@heroicons/react/24/outline'
import AddProductDialog from './add-product-dialog'
import WebInterface from '~/pages/interceptor/web.interceptor'
import CreateInvoice from './create-billing'
import ThirdParties from '#models/third_parties'
import { useState } from 'react'

interface ErrorFieldsReglement {
  amount?: boolean
  paymentDate?: boolean
}

interface BillingsSupplierInfoPorps {
  billing: BillingResponse
  products: ProductResponse[]
  item: BillingItem[]
  customers: ThirdParties[]
}

export default function BillingsSupplierInfo({
  billing,
  item,
  products,
  customers,
}: BillingsSupplierInfoPorps) {
  const { props } = usePage<any>()
  const webInterface = new WebInterface(props.csrfToken)

  const { delete: destroy, processing } = useForm({
    type: billingType[0].value,
    thirdPartiesId: '',
    billingDate: '',
    description: '',
    status: BillingStatus.DRAFT,
  })
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openBillingDialog, setOpenBillingDialog] = useState(false)
  const [openBillingDialogStatus, setOpenBillingDialogStatus] = useState(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openConfirmItem, setOpenConfirmItem] = useState(false)
  const [priceItem, setPriceItem] = useState<string | string | number>('')
  const [quantityItem, setQuantityItem] = useState<string | string | number>('')
  const [discountItem, setDiscountItem] = useState<string | string | number>('')
  const [selectedItem, setSelectedItem] = useState<BillingItem | null>(null) // Ajouté pour gérer l'élément sélectionné
  const [openModalProduct, setOpenModalProduct] = useState(false)
  const [openModalPayment, setOpenModalPayment] = useState(false)
  const [openModalBillingForm, setOpenModalBillingForm] = useState(false)
  const [openEditModalBilling, setOpenEditModalBilling] = useState(false)

  const [paymentDate, setPaymentDate] = useState<string | null>()
  const [comment, setComment] = useState<string | null>()
  const [paymentAmount, setPaymentAmount] = useState<string | number>('')

  const [openConfirmDeletePayment, setOpenConfirmDeletePayment] = useState(false)
  const [paymentId, setPaymentId] = useState<string>('')

  const [refundType, setRefundType] = useState<'partial' | 'full'>('partial')
  const [libelle, setLibelle] = useState<string | null>()
  const [billingDate, setBillingDate] = useState<string | null>()
  const [fieldErrorReglement, setFieldErrorReglement] = useState<ErrorFieldsReglement>()
  const [openDetailDialog, setOpenDetailDialog] = useState(false)

  const fieldErrorReglementValidate = {
    amount: paymentAmount,
    paymentDate: paymentDate,
  }

  const columns: Column<BillingItem>[] = [
    {
      Header: 'Description',
      accessor: 'code',
      render: (data) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/product?mainmenu=list-products&detail=${data.productId}`}
            className="text-blue-500 hover:underline"
          >
            {`${data.reference} `}
          </Link>
          - {data.name}
        </div>
      ),
      sortable: false,
    },
    {
      Header: 'Qté',
      accessor: 'quantity',
      sortable: false,
    },
    {
      Header: 'Prix U. HT',
      accessor: 'pu_ht',
      sortable: false,
      render: (data) => <div className="text-right">{`${formatNumber(data.price!)} FCFA`}</div>,
    },
    {
      Header: 'TVA. U',
      accessor: 'ref',
      sortable: false,
      render: (data) => (
        <div className="text-right">{data.tva ? `${data.tva} FCFA` : '0 FCFA'}</div>
      ),
    },
    {
      Header: 'Remise',
      accessor: 'redu',
      sortable: false,
      render: (data) => (
        <div className="text-right">
          {!isNil(data.discount) ? `${data.discount} FCFA` : '0 FCFA'}
        </div>
      ),
    },
    {
      Header: 'Total HT',
      accessor: 'total',
      sortable: false,
      render: (data) => (
        <div className="text-right">{`${formatNumber(data.price! * data.quantity)} FCFA`}</div>
      ),
    },
    {
      Header: '',
      accessor: 'action',
      sortable: false,
      render: (data) => {
        const checkFullRefund = billing.isFullRefund
        const checkStatus = billing.status === BillingStatus.DRAFT
        return (
          <>
            {(checkStatus || checkFullRefund) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPriceItem(data.price)
                    setQuantityItem(data.quantity)
                    setDiscountItem(!isNil(data.discount) ? data.discount! : '')
                    setSelectedItem(data)
                    setOpenEditDialog(true)
                  }}
                  className="text-yellow-500"
                >
                  <EditIcon className="h-6 w-6 cursor-pointer hover:bg-gray-300 p-1 rounded-full" />
                </button>
                <button
                  onClick={() => {
                    setOpenConfirmItem(true)
                    setSelectedItem(data)
                  }}
                  className="text-red-500"
                >
                  <TrashIcon className="h-6 w-6 cursor-pointer hover:bg-gray-300 p-1 rounded-full" />
                </button>
                <ConfirmDialog
                  isOpen={openConfirmItem}
                  isLoading={isLoading}
                  setOpen={() => setOpenConfirmItem(!openConfirmItem)}
                  onConfirm={handleConfirmDeleteItem}
                />
              </div>
            )}
          </>
        )
      },
    },
  ]

  const handleSave = async () => {
    if (!selectedItem) return

    try {
      setIsLoading(true)
      const body = {
        tva: null,
        price: Number(priceItem),
        quantity: Number(quantityItem),
        discount: Number(discountItem),
      }

      await webInterface.put(`/dashboard/billings/item/${selectedItem.billingItemId}/update`, body)
      router.visit(`/dashboard/billings/${billing.id}`)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDeleteItem = async () => {
    if (!selectedItem) return
    setIsLoading(true)
    try {
      const response = await webInterface.delete(
        `/dashboard/billings/item/${selectedItem.billingItemId!}`
      )
      if (!isUndefined(response.status) && response.status !== 200) {
        toast.error('Erreur de la suppression.')
        return
      }
      router.visit(`/dashboard/billings/${billing.id}`)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    destroy(`/dashboard/billings/${billing.id}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Suppréssion éffectuée...')
        setOpenConfirm(false)
      },
    })
  }

  const handleConfirmBilling = async () => {
    if (!isNil(billing.parentBillingId)) {
      const data = {
        parentBillingId: billing.parentBillingId,
      }
      await webInterface.put(`/dashboard/billings-credit/${billing.id}/status`, data)
      router.visit(`/dashboard/billings/${billing.id}`)
    } else {
      const data: any = {
        refBillingSupplier: billing.refBillingSupplier,
        description: billing.description,
        billingDate: billing.billingDate,
        paymentDeadline: billing.paymentDeadline,
        status: billing.status,
        type: billing.type,
      }
      if (billing.status === BillingStatus.DRAFT) {
        await webInterface.put(`/dashboard/billings/${billing.id}/status`, {
          ...data,
          status: BillingStatus.VALIDATE,
        })
        router.visit(`/dashboard/billings/${billing.id}`)
      }
    }
  }

  const validateFields = () => {
    const errors: ErrorFieldsReglement = {}
    Object.keys(fieldErrorReglementValidate).forEach((key) => {
      if (isEmpty((fieldErrorReglementValidate as any)[key])) {
        errors[key as keyof ErrorFieldsReglement] = true
      }
    })

    if (Object.keys(errors).length > 0) {
      setFieldErrorReglement(errors)
      return false
    }
    setFieldErrorReglement({})

    return true
  }

  const handleAddPayment = async () => {
    if (!validateFields()) {
      return
    }

    try {
      const amount = Number(paymentAmount)
      const remaining = Number(billing.remainingPrice)

      if (amount > remaining) {
        alert('Le montant du paiement dépasse le montant restant à payer.')
        return
      }

      setIsLoading(true)

      const body: BillingPayment = {
        amount,
        billingsId: billing.id,
        oldAmount: remaining,
        paymentDate: paymentDate!,
        comment: comment ? comment : null,
      }

      await webInterface.post(`/dashboard/billing-payment`, body)
      router.visit(`/dashboard/billings/${billing.id}`)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDeletePayment = async () => {
    await webInterface.delete(`/dashboard/billing-payment/${paymentId}/remove`)
    router.visit(`/dashboard/billings/${billing.id}`)
  }

  const handleConfirmBillingStatus = async () => {
    const data: any = {
      refBillingSupplier: billing.refBillingSupplier,
      description: billing.description,
      billingDate: billing.billingDate,
      paymentDeadline: billing.paymentDeadline,
      status: billing.status,
      type: billing.type,
    }
    if (billing.status === BillingStatus.BEGIN) {
      await webInterface.put(`/dashboard/billings/${billing.id}/status`, {
        ...data,
        status: BillingStatus.PAID_PARTIALLY,
      })
    } else if (billing.status === BillingStatus.PAID_PARTIALLY) {
      await webInterface.put(`/dashboard/billings/${billing.id}/status`, {
        ...data,
        status: BillingStatus.BEGIN,
      })
    } else if (billing.status === BillingStatus.VALIDATE) {
      await webInterface.put(`/dashboard/billings/${billing.id}/status`, {
        ...data,
        status: BillingStatus.ABANDONED,
      })
    }
    router.visit(`/dashboard/billings/${billing.id}`)
  }

  const handleConfirm = async () => {
    const body = {
      parentBillingId: billing.id,
      type: billingType[2].value,
      status: BillingStatus.DRAFT,
      isFullRefund: refundType === 'full' ? true : false,
      description: libelle,
      billingDate,
      amountIncludingVat: billing.amountIncludingVat?.toString(),
      amountExcludingVat: billing.amountExcludingVat?.toString(),
      vatAmount: billing.vatAmount?.toString(),
      ..._.omit(billing, [
        'files',
        'parentBilling',
        'thirdParties',
        'user',
        'billingItem',
        'billingPayments',
        'currencies',
        'type',
        'status',
        'parentBillingId',
        'description',
        'billingDate',
        'isFullRefund',
        'amountIncludingVat',
        'amountExcludingVat',
        'vatAmount',
      ]),
      billingItem: _.map(item, (item) =>
        _.pick(item, ['productId', 'quantity', 'price', 'total', 'discount', 'tva'])
      ),
    }
    const response = await webInterface.post(`/dashboard/billings/credit`, body)
    router.visit(`/dashboard/billings/${response.id}`)
  }

  const handleDowloadDoc = () => {
    setOpenDetailDialog(true)
  }

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content')
    if (!printContent) return

    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression Facture</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: monospace;
            }
            body {
              width: 58mm;
              color: black;
              background: white;
            }
            .receipt-wrapper {
              width: 58mm;
              padding: 3mm 1mm;
              background: white;
              color: black;
            }
            img {
              max-width: 25mm;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            .divider {
              width: 100%;
              border-top: 1px dashed #000;
              margin: 4px 0;
            }
            p {
              margin: 1px 0;
              line-height: 1.2;
              font-size: 10px;
              color: black;
            }
            .text-xs {
              font-size: 9px;
            }
            .text-center {
              text-align: center;
            }
            .flex {
              display: flex;
            }
            .justify-between {
              justify-content: space-between;
            }
            @media print {
              body {
                width: 58mm;
                margin: 0;
                padding: 0;
              }
              .receipt-wrapper {
                width: 100%;
                color: black !important;
                background: white !important;
                -webkit-print-color-adjust: exact;
              }
              * {
                color: black !important;
                background: white !important;
                font-family: monospace !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex flex-col gap-4">
      <BillingsSupplierHeader billing={billing} />
      <hr />
      <div className="flex items-start w-full py-2 gap-10">
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Type</span>
            <span className="text-slate-500 text-sm">Auteur</span>
            <span className="text-slate-500 text-sm">Description</span>
            <span className="text-slate-500 text-sm">Date facturation</span>
            <span className="text-slate-500 text-sm">Devise</span>{' '}
            <span className="text-slate-500 text-sm">Document de la facture</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <div className="flex items-start">
              <Badge
                text={billingType.find((item) => item.value === billing.type)?.name!}
                type="secondary"
              />
            </div>
            <hr />
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 rounded" />
              <span className="text-sm">{billing.user?.name}</span>
            </div>
            <hr />
            <p className="text-sm">{!isNil(billing.description) ? billing.description : '#'}</p>
            <hr />
            <p className="text-sm flex items-center justify-between gap-2">
              {!isNil(billing.billingDate) ? formatDateTime(billing.billingDate!, false) : '#'}
            </p>
            <hr />
            <p className="text-sm">FCFA</p>
            <hr />
            <div className="flex items-center justify-start gap-4">
              <p className="text-sm text-left">
                {billing.status !== BillingStatus.DRAFT && (
                  <Button
                    color="warning"
                    label={'Imprimer la facture'}
                    onClick={() => {
                      setOpenDetailDialog(true)
                    }}
                  />
                )}
              </p>
            </div>

            <hr />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-4 w-1/2">
          <div className="col-span-2 grid grid-cols-1 gap-2">
            <span className="text-slate-500 text-sm">Montant HT</span>
            <span className="text-slate-500 text-sm">Montant TVA</span>
            <span className="text-slate-500 text-sm">Montant TTC</span>
          </div>
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <p className="text-sm text-right">
              {!isNil(billing.amountExcludingVat)
                ? `${formatNumber(Number(billing.amountExcludingVat)!)} FCFA`
                : '0 FCFA'}
            </p>
            <hr />
            <p className="text-sm text-right">
              {!isNil(billing.vatAmount)
                ? `${formatNumber(Number(billing.vatAmount)!)} FCFA`
                : '0 FCFA'}
            </p>
            <hr />
            <p className="text-sm text-right">
              {!isNil(billing.amountIncludingVat)
                ? `${formatNumber(Number(billing.amountIncludingVat)!)} FCFA`
                : '0 FCFA'}
            </p>
            <hr />
          </div>
          <table className="w-full divide-y col-span-6 divide-gray-300">
            <thead className={classNames('bg-green-800')}>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-40 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Règlements
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Date du règlement
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                ></th>
                {/* <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Numéro
                </th> */}
                <th
                  scope="col"
                  className="text-right py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Montant
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-20 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {!isEmpty(billing.billingPayments) ? (
                billing.billingPayments?.map((item) => (
                  <tr key={item.id!} className={classNames('hover:bg-green-50 even:bg-gray-50 ')}>
                    <td className="pl-4 py-4 font-medium text-sm text-blue-400">{item?.code}</td>
                    <td className="text-right pl-4 py-4 font-medium text-sm text-gray-text">
                      {formatDateTime(item.paymentDate!, false)}
                    </td>
                    <td className="text-right pl-4 py-4 font-medium text-sm text-gray-text">
                      {/* {item.paymentMode!.libelle!} */}
                    </td>
                    {/* <td className="pl-4 py-4 font-medium text-sm text-gray-text">
                      {item.accountNumber}
                    </td> */}
                    <td className="pl-4 py-4 font-medium text-right text-sm text-gray-text">
                      {formatNumber(item.amount)}
                    </td>
                    <td className="flex justify-end pr-4 py-4 font-medium text-sm text-gray-text">
                      {billing.status === BillingStatus.VALIDATE ||
                        (billing.status === BillingStatus.BEGIN && (
                          <RemoveIcon
                            onClick={() => {
                              setOpenConfirmDeletePayment(true)
                              setPaymentId(item.id!)
                            }}
                            className="h-6 w-6 text-red-600 cursor-pointer bg-red-50 hover:bg-red-100 p-1 rounded-full"
                          />
                        ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-slate-400  text-sm">
                  <td className="p-2">
                    <span>Aucune données</span>
                  </td>
                </tr>
              )}
              <tr className="text-slate-400  text-sm">
                <td colSpan={4} className="p-2">
                  <p className="text-right">Déjà réglé</p>
                </td>
                <td className="p-2 text-right">
                  <span className="text-black">{formatNumber(billing.allocatedPrice)}</span>
                </td>
              </tr>
              <tr className="text-slate-400  text-sm">
                <td colSpan={4} className="p-2">
                  <p className="text-right">Facturé</p>
                </td>
                <td className="p-2 text-right">
                  <span className="text-black ">
                    {billing.amountIncludingVat
                      ? formatNumber(parseFloat(billing.amountIncludingVat)!)
                      : '0'}
                  </span>
                </td>
              </tr>
              {!isEmpty(billing.childrenBillings) && (
                <tr className="text-slate-400  text-sm">
                  <td colSpan={4} className="p-2">
                    <p className="text-right">Réglement avoir </p>
                  </td>
                  <td className="p-2 text-right">
                    {/* {formatNumber(
                    _.sumBy(
                      billing.childrenBillings,
                      "allocatedPrice"
                    )
                  )} */}
                    {billing.childrenBillings?.map((item, i) => {
                      return (
                        <span key={i} className="text-red-600 text-sm">
                          {item.allocatedPrice}
                          <br />
                        </span>
                      )
                    })}
                  </td>
                </tr>
              )}

              <tr className="text-slate-400  text-sm">
                <td colSpan={4} className="p-2">
                  <p className="text-right">Reste à payer </p>
                </td>
                <td className="p-2 text-right">
                  <span className="text-red-600 text-xl">
                    {formatNumber(billing.remainingPrice)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-2 items-center">
        {isNil(billing.parentBillingId) && billing.status === BillingStatus.DRAFT && (
          <div className="flex flex-row justify-end gap-2 items-center">
            <Button
              color="secondary"
              icon={<PlusIcon className="h-4 w-4 text-white" />}
              label={'Ajouter un produit | service'}
              onClick={() => {
                setOpenModalProduct(true)
              }}
            />
          </div>
        )}
      </div>
      <div className="overflow-y-auto h-full">
        <DataTable<BillingItem> columns={columns} data={item} itemsPerPage={100} />
      </div>
      <div className="flex flex-col justify-between gap-8 mt-8">
        <div className="flex flex-row justify-end gap-2 items-center">
          {isNil(billing?.isFullRefund) &&
            (billing.status === BillingStatus.VALIDATE ||
              billing.status === BillingStatus.BEGIN) && (
              <Button
                color="info"
                label={'Saisir Règlement'}
                onClick={() => setOpenModalPayment(true)}
              />
            )}

          {isNil(billing?.isFullRefund) && billing.status === BillingStatus.VALIDATE && (
            <Button
              color="secondary"
              label={"Classer 'ABANDONNÉE'"}
              onClick={() => setOpenBillingDialogStatus(true)}
            />
          )}

          {isNil(billing?.isFullRefund) && billing.status === BillingStatus.BEGIN && (
            <Button
              color="secondary"
              label={"Classer 'PAYÉE PARTIELLEMENT'"}
              onClick={() => setOpenBillingDialogStatus(true)}
            />
          )}

          {item.length > 0 && billing.status === BillingStatus.DRAFT && (
            <Button
              color="primary"
              label={'Valider'}
              // disabled={isEmpty(billingItem)}
              onClick={() => setOpenBillingDialog(true)}
            />
          )}
          {billing.status === BillingStatus.DRAFT && (
            <Button
              color="warning"
              label={'Modifier'}
              onClick={() => setOpenEditModalBilling(true)}
            />
          )}
          {isNil(billing?.parentBillingId) &&
            billing.status !== BillingStatus.DRAFT &&
            billingType[1].value! !== billing.type && (
              <Button
                color="primary"
                label={'Créer facture avoir'}
                onClick={() => setOpenModalBillingForm(true)}
              />
            )}
          {(billing.status === BillingStatus.DRAFT || isNil(billing?.parentBillingId)) && (
            <Button
              color="danger"
              label="Supprimer"
              icon={<TrashIcon className="h-4 w-4 text-white" />}
              onClick={() => setOpenConfirm(true)}
              disabled={billing.status !== BillingStatus.DRAFT}
            />
          )}
          {billing.status !== BillingStatus.DRAFT && billing.status !== BillingStatus.VALIDATE && (
            <Button label="Générer" onClick={() => handleDowloadDoc()} color="warning" size="xs" />
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 mt-8">
        <div className="col-span-2">
          <h1 className="flex items-center gap-2 mb-2">
            <InvoiceIcon className="h-4 w-4" />
            Factures avoir(s) liées ({billing.childrenBillings?.length})
          </h1>
          <table className="w-full divide-y col-span-6 divide-gray-300">
            <thead className={classNames('bg-green-800 bg-primary-100 ')}>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-40 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Date
                </th>

                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Montant HT
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 w-32 pr-3 text-left text-white text-sm font-semibold sm:pl-3"
                >
                  Montant TTC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {!isEmpty(billing.childrenBillings) ? (
                billing.childrenBillings?.map((item) => (
                  <tr key={item.id!} className={classNames('hover:bg-green-50 even:bg-gray-50 ')}>
                    <td className="pl-4 py-4 font-medium text-sm text-blue-400">
                      <Link
                        href={`/dashboard/billings/${item.id}`}
                        className=" text-blue-500 hover:underline"
                        target="_blank"
                      >
                        {item?.code}
                      </Link>
                    </td>
                    <td className="pl-4 py-4 font-medium text-sm text-gray-text">
                      {item?.description}
                    </td>
                    <td className="pl-4 py-4 font-medium text-sm text-gray-text">
                      {formatDateTime(item.billingDate!, false)}
                    </td>

                    <td className="pl-4 py-4 font-medium text-sm text-right text-gray-text">
                      {`${formatNumber(parseFloat(item.amountExcludingVat!))}`}
                    </td>

                    <td className="pl-4 py-4 font-medium text-sm text-right text-gray-text">
                      {`${formatNumber(parseFloat(item.amountIncludingVat!))}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-slate-400  text-sm">
                  <td className="p-2">
                    <span>Aucune données</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmOrderDialog
        isOpen={openBillingDialog}
        isLoading={processing}
        setOpen={() => setOpenBillingDialog(!openBillingDialog)}
        onConfirm={handleConfirmBilling}
        title={
          billing.status === BillingStatus.VALIDATE ? 'Clôturer la facture' : 'Valider la facture'
        }
        description={
          billing.status === BillingStatus.VALIDATE ? (
            <>Étes-vous sûre de vouloir classer cette facture à Délivrée ? </>
          ) : (
            <>
              Étes-vous sûre de vouloir valider cette facture sous la référence{' '}
              <span className="font-semibold text-black">{billing.code}</span>
            </>
          )
        }
      />

      <ConfirmOrderDialog
        isOpen={openBillingDialogStatus}
        isLoading={processing}
        setOpen={() => setOpenBillingDialogStatus(!openBillingDialogStatus)}
        onConfirm={handleConfirmBillingStatus}
        title={
          billing.status === BillingStatus.VALIDATE ? "Classer 'Payée'" : 'Annuler une facture'
        }
        description={
          billing.status === BillingStatus.BEGIN ? (
            <>
              Cette facture n&apos;a pas été payée à hauteur du montant initial. Étes-vous sûre de
              vouloir la classer malgré tout ? ?{' '}
            </>
          ) : (
            <>
              Étes-vous sûre de vouloir annuler la facture{' '}
              <span className="font-semibold text-black">
                {billing.code}
                {' ?'}
              </span>
            </>
          )
        }
      />

      <ConfirmDialog
        isOpen={openConfirm}
        isLoading={processing}
        setOpen={() => setOpenConfirm(!openConfirm)}
        onConfirm={handleConfirmDelete}
      />
      <ConfirmDialog
        title="Supprimer le paiement"
        description="Êtes-vous sûre de vouloir supprimer ce paiement ?"
        isOpen={openConfirmDeletePayment}
        isLoading={processing}
        setOpen={() => setOpenConfirmDeletePayment(!openConfirmDeletePayment)}
        onConfirm={handleConfirmDeletePayment}
      />
      <DialogModal
        title={'Saisir règlement'}
        open={openModalPayment}
        setOpen={() => setOpenModalPayment(!openModalPayment)}
        size="3xl"
        confirmTitle={'Payé'}
        handleConfirm={() => handleAddPayment()}
        isLoading={isLoading}
        color={'info'}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-start">
              <div className="flex justify-start">
                <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                  Montant règlement<span className="text-xs text-red-600">*</span>
                </label>
              </div>
              <Input
                type="number"
                value={paymentAmount}
                block
                onChange={(e) => setPaymentAmount(e.target.value)}
                error={fieldErrorReglement?.amount}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start">
              <div className="flex justify-start">
                <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                  Date<span className="text-xs text-red-600">*</span>
                </label>
              </div>
              <Input
                type="date"
                value={paymentDate!}
                disabled={processing}
                block
                onChange={(e) => setPaymentDate(e.target.value)}
                error={fieldErrorReglement?.paymentDate}
              />
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex justify-start">
              <label
                htmlFor="email"
                className="block w-52 text-base font-normal leading-6 text-gray-text"
              >
                Commentaires:
              </label>
            </div>
            <textarea
              name=""
              id=""
              placeholder="Entrer une commentaire"
              cols={10}
              rows={4}
              value={comment!}
              disabled={processing}
              onChange={(e) => setComment(e.target.value)}
              className={classNames(
                'focus:outline-green-700 focus:ring-green-700 block w-full rounded-md border-0 px-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-sub-heading/80 placeholder:font-light focus:ring-1  focus:ring-inset sm:text-sm sm:leading-6'
              )}
            ></textarea>
          </div>
        </div>
      </DialogModal>

      <CreateInvoice
        thirdParties={customers}
        currentInvoice={billing}
        openAddModal={openEditModalBilling}
        handleOpenModal={() => setOpenEditModalBilling(false)}
      />

      <DialogModal
        title={
          selectedItem?.type === ProductType.PRODUCT ? 'Modifier le produit' : 'Modifier le service'
        }
        open={openEditDialog}
        setOpen={() => setOpenEditDialog(!openEditDialog)}
        size="3xl"
        confirmTitle="Modifier"
        handleConfirm={handleSave}
        isLoading={isLoading}
        color="warning"
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-40 text-base font-normal leading-6 text-gray-text">
                {selectedItem?.type === ProductType.PRODUCT ? 'Produit' : 'Service'}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span>
                {selectedItem?.reference} - {selectedItem?.name}
              </span>
            </div>
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
              value={quantityItem}
              onChange={(e) => setQuantityItem(e.target.value)}
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
              value={priceItem}
              onChange={(e) => setPriceItem(e.target.value)}
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
              value={discountItem}
              onChange={(e) => setDiscountItem(e.target.value)}
              block
            />
          </div>
        </div>
      </DialogModal>

      <AddProductDialog
        billing={billing}
        products={products}
        openModalProduct={openModalProduct}
        handleOpenModal={() => setOpenModalProduct(false)}
      />

      <DialogModal
        title={'Créer un avoir'}
        open={openModalBillingForm}
        setOpen={() => setOpenModalBillingForm(!openModalBillingForm)}
        size="3xl"
        color={'warning'}
        confirmTitle={'Confirmer'}
        handleConfirm={() => handleConfirm()}
        isLoading={processing}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex justify-start">
              <label className="block w-80 text-base font-normal leading-6 text-gray-text">
                Remboursement partiel
              </label>
            </div>
            <Switch
              as="button"
              checked={refundType === 'partial'}
              onChange={() => setRefundType('partial')}
              className={`${
                refundType === 'partial' ? 'bg-green-600' : 'bg-gray-200'
              } relative inline-flex flex-shrink-0 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline`}
            >
              {({ checked }) => (
                <span
                  className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                  } inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full`}
                />
              )}
            </Switch>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex justify-start">
              <label className="block w-80 text-base font-normal leading-6 text-gray-text">
                Remboursement intégral
              </label>
            </div>
            <Switch
              as="button"
              checked={refundType === 'full'}
              onChange={() => setRefundType('full')}
              className={`${
                refundType === 'full' ? 'bg-green-600' : 'bg-gray-200'
              } relative inline-flex flex-shrink-0 h-6 transition-colors duration-200 ease-in-out border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline`}
            >
              {({ checked }) => (
                <span
                  className={`${
                    checked ? 'translate-x-5' : 'translate-x-0'
                  } inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full`}
                />
              )}
            </Switch>
          </div>
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                Motif<span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <Input
              type="text"
              placeholder="Quel est le motif?"
              onChange={(e) => setLibelle(e.target.value)}
              className="w-[500px]"
            />
          </div>
          <div className="flex items-center">
            <div className="flex justify-start">
              <label className="block w-52 text-base font-normal leading-6 text-gray-text">
                Date de l&apos;avoir
                <span className="text-xs text-red-600">*</span>
              </label>
            </div>
            <Input
              type="date"
              value={billingDate!}
              disabled={processing}
              onChange={(e) => setBillingDate(e.target.value)}
              className="w-[500px]"
            />
          </div>
        </div>
      </DialogModal>

      {/* Modal d'impression de facture */}
      <DialogModal
        title={`Facture #${billing.code}`}
        open={openDetailDialog}
        setOpen={() => {
          setOpenDetailDialog(false)
        }}
        size="xl"
        color="warning"
      >
        <div className="p-6">
          {/* Contenu pour l'impression (caché à l'écran) */}
          <div id="receipt-content" className="hidden">
            <div className="text-center">
              <p className="text-xs">CENTRE DE SANTÉ LA GRACE B</p>
              <p className="text-xs">--------------------------------</p>
              <p className="text-xs">FACTURE</p>
              <p className="text-xs">--------------------------------</p>
              <p className="text-xs">Réf: #{billing.code}</p>
              <p className="text-xs">
                Date: {formatDateTime(billing.billingDate || billing.createdAt, true)}
              </p>
              <p className="text-xs">Client: {billing.thirdParties?.name || 'N/A'}</p>
              {billing.thirdParties?.clientCode && (
                <p className="text-xs">Vendeur: {billing.user.name}</p>
              )}
              <p className="text-xs">--------------------------------</p>

              {item?.map((billingItem, index) => (
                <div key={index} className="text-xs flex justify-between">
                  <span>
                    {billingItem.quantity}x {billingItem.name || billingItem.reference}
                  </span>
                  <span>{formatNumber(billingItem.price * billingItem.quantity)} FCFA</span>
                </div>
              ))}

              <p className="text-xs">--------------------------------</p>
              <div className="text-xs flex justify-between">
                <span>Montant HT:</span>
                <span>{formatNumber(Number(billing.amountExcludingVat || 0))} FCFA</span>
              </div>
              {Number(billing.vatAmount || 0) > 0 && (
                <div className="text-xs flex justify-between">
                  <span>TVA:</span>
                  <span>{formatNumber(Number(billing.vatAmount || 0))} FCFA</span>
                </div>
              )}
              <div className="text-xs flex justify-between">
                <span>TOTAL TTC:</span>
                <span>{formatNumber(Number(billing.amountIncludingVat || 0))} FCFA</span>
              </div>
              {billing.allocatedPrice && billing.allocatedPrice > 0 && (
                <>
                  <div className="text-xs flex justify-between">
                    <span>Montant payé:</span>
                    <span>{formatNumber(billing.allocatedPrice)} FCFA</span>
                  </div>
                  <div className="text-xs flex justify-between">
                    <span>Reste à payer:</span>
                    <span>{formatNumber(billing.remainingPrice || 0)} FCFA</span>
                  </div>
                </>
              )}
              <p className="text-xs">--------------------------------</p>
              <p className="text-xs">
                Statut:{' '}
                {billingStatus.find((s) => s.status === billing.status)?.name || billing.status}
              </p>
              <p className="text-xs">--------------------------------</p>
              <p className="text-xs">TVA non applicable</p>
              <p className="text-xs">--------------------------------</p>
              <p className="text-xs">AU REVOIR ET À BIENTÔT</p>
            </div>
          </div>

          {/* Informations sur la facture (affichage écran) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Date de facturation</p>
              <p className="font-medium">
                {formatDateTime(billing.billingDate || billing.createdAt, true)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-medium">{billing.thirdParties?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Liste des produits */}
          <h3 className="font-medium text-lg mb-4 text-gray-700 border-b border-amber-300 pb-2">
            Produits facturés
          </h3>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 border-b border-amber-300">
                  <th className="pb-2">Produit</th>
                  <th className="pb-2">Prix unitaire</th>
                  <th className="pb-2">Quantité</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {item?.map((billingItem, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-3">{billingItem.name || billingItem.reference}</td>
                    <td className="py-3">{formatNumber(billingItem.price)} FCFA</td>
                    <td className="py-3">{billingItem.quantity}</td>
                    <td className="py-3 text-right">
                      {formatNumber(billingItem.price * billingItem.quantity)} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="bg-amber-50 rounded-lg p-4 mb-4 border border-amber-300">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Montant HT:</span>
              <span className="font-medium">
                {formatNumber(Number(billing.amountExcludingVat || 0))} FCFA
              </span>
            </div>
            {Number(billing.vatAmount || 0) > 0 && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">TVA:</span>
                <span className="font-medium">
                  {formatNumber(Number(billing.vatAmount || 0))} FCFA
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-amber-300">
              <span className="text-gray-700">Total TTC:</span>
              <span className="text-green-600">
                {formatNumber(Number(billing.amountIncludingVat || 0))} FCFA
              </span>
            </div>
            {billing.allocatedPrice && billing.allocatedPrice > 0 && (
              <>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-700">Montant payé:</span>
                  <span className="font-medium">{formatNumber(billing.allocatedPrice)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Reste à payer:</span>
                  <span className="font-medium text-orange-600">
                    {formatNumber(billing.remainingPrice || 0)} FCFA
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Statut */}
          <div className="text-sm text-gray-600 mb-4">
            <p>
              <i className="fas fa-info-circle mr-2"></i>
              Statut:{' '}
              {billingStatus.find((s) => s.status === billing.status)?.name || billing.status}
            </p>
          </div>
        </div>

        {/* Pied du modal */}
        <div className="px-6 py-3 bg-gray-100 text-right border-t border-amber-300">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded bg-amber-500 text-white font-medium hover:bg-amber-600"
          >
            Imprimer le reçu
          </button>
        </div>
      </DialogModal>
    </div>
  )
}
