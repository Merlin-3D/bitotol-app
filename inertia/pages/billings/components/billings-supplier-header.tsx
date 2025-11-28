import { Link } from '@inertiajs/react'
import { isEmpty } from 'lodash'
import Badge from '~/components/badge'
import { InvoiceIcon } from '~/components/icons'
import CustomerIcon from '~/components/icons/customers.icon'
import { billingStatus } from '~/pages/utils/common'
import { BillingResponse } from '~/pages/utils/entities'

interface BillingsCustormerHeaderProps {
  billing: BillingResponse
}

export default function BillingsCustormerHeader({ billing }: BillingsCustormerHeaderProps) {
  return (
    <div className="flex flex-row items-start justify-between pb-2">
      <div className="flex items-start gap-4">
        <div className="shadow-md rounded-md relative p-4">
          <InvoiceIcon className="h-12 w-12 text-gray-500" />
        </div>
        <div className="flex flex-col justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="capitalize font-medium text-lg flex items-center gap-2">
                {billing.code}
              </h1>
              <div className="flex items-center gap-2">
                {!isEmpty(billing.childrenBillings) && (
                  <span className="text-xs bg-blue-200 font-medium rounded-md px-1 text-blue-600">
                    Cette facture a déjà fait l&apos;objet d&apos;avoirs
                  </span>
                )}

                {!isEmpty(billing.parentBillingId) && (
                  <span className="text-xs">Correction facture: </span>
                )}
                {!isEmpty(billing.parentBillingId) && (
                  <div>
                    {
                      <Link href={`/dashboard/billings/${billing.parentBillingId}`}>
                        <Badge text={billing.parentBilling!.code} type="info" />
                      </Link>
                    }
                  </div>
                )}
              </div>
            </div>

            <h1 className="capitalize font-medium text-base text-sub-headings flex items-center gap-2">
              <span className="text-sub-heading">Réf. client:</span>
              {billing.thirdParties?.clientCode}
            </h1>
          </div>
          <span className="capitalize font-medium text-base">
            <div className="flex items-center gap-2">
              <CustomerIcon className="w-5 h-5 rounded" />
              <span>{billing.thirdParties?.name}</span>
            </div>
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-between items-end gap-8">
        <Link href={'/dashboard/billings'} className=" font-medium text-lg">
          Retour a la liste
        </Link>
        <div className="flex items-center gap-4">
          <Badge
            type={billingStatus.find((item) => item.status === billing.status)?.type! as any}
            text={billingStatus.find((item) => item.status === billing.status)?.name!}
          />
        </div>
      </div>
    </div>
  )
}
