import { ProductType } from '#models/enum/product_enum'
import { Link } from '@inertiajs/react'
import { isNil } from 'lodash'
import { ProductIcon, ServiceIcon } from '~/components/icons'
import { formatDateTime } from '~/pages/utils/common'
import { ProductResponse } from '~/pages/utils/entities'

interface ProductHeaderProps {
  product: ProductResponse
}
export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-start gap-4">
          <div className="shadow-lg rounded-lg relative p-4">
            {!isNil(product.type) && product.type === ProductType.PRODUCT ? (
              <ProductIcon className="rounded w-12 h-12" />
            ) : (
              <ServiceIcon className="rounded w-12 h-12" />
            )}
          </div>
          <div className="flex flex-col justify-between gap-16">
            <div className="flex flex-col">
              <h1 className="capitalize font-medium text-lg flex items-center gap-4">
                Réf. {product.reference}
              </h1>
              <h1 className="capitalize font-medium text-base text-sub-headings flex items-center gap-4">
                {product.name}
              </h1>
            </div>
            <span className="capitalize font-medium text-xs">
              Ajouter le: {formatDateTime(product.createdAt!, true)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between items-end gap-20">
          <Link href={'/dashboard/products'} className=" font-medium text-lg">
            Retour a la liste
          </Link>
        </div>
      </div>
      <hr />
    </div>
  )
}
