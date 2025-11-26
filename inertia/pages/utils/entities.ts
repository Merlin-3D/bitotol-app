import ThirdParties from '#models/third_parties'

export interface User {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductRequest {
  reference: string
  name: string
  userId: string
  description?: string
  warehousesId?: string | null
  active: boolean
  limitStockAlert?: any
  sellingPrice?: any
  optimalStock?: any
}

export interface ProductResponse extends ProductRequest {
  id: string
  warehouse?: WarehaouseResponse
  user?: User
  stocks?: StockResponse[]
  type: string
  expiredAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface StockRequest {
  productId: string
  warehousesId: string
  userId: string
  quantity: number | null
  unitPurchasePrice: string | number | null
  physicalQuantity: number
  virtualQuantity: number
  type: string
  title: string
}

export interface StockResponse extends StockRequest {
  id: string
  warehouse?: WarehaouseResponse
  product: ProductResponse
  valorisationAchat?: number | null
  pmp?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface WarehaouseResponse extends WarehaouseRequest {
  id: string
  stocks?: StockResponse[]
  createdAt?: string
  updatedAt?: string
}

export interface WarehaouseRequest {
  reference: string
  name: string
  address?: string
  phone?: string
  description?: string
}

export interface MovementResponse {
  id: string
  reference: string
  stocksId: string
  saleId: string
  title: string
  code: string
  movementQuantity: string
  movementType: string
  userId: string
  movementDate: string
  createdAt: string
  updatedAt?: string
  stock: StockResponse
  user: User
}
export interface BillingRequest {
  refBillingSupplier: string
  thirdPartiesId: string
  type: string
  description: string | null
  billingDate: string
  paymentDeadline: string
  status: string
  amountIncludingVat?: string | null
  amountExcludingVat?: string | null
  vatAmount?: string | null
  userId: string
}

export interface BillingResponse extends BillingRequest {
  id: string
  code: string
  paymentMode?: string
  thirdParties?: {
    id: string
    name: string
    clientCode: string
  }
  parentBillingId?: string
  childrenBillings?: BillingResponse[]
  parentBilling?: BillingResponse
  remainingPrice: number
  allocatedPrice: number
  billingPayments: BillingPayment[]
  isFullRefund: boolean | null
  user: User
  createdAt: string
  updatedAt: string
}

export interface BillingItem extends ProductResponse {
  billingItemId?: string
  tva?: string
  discount?: string
  priceIncludingVat: number
  product?: ProductResponse
  productId: string
  quantity: number
  remainingQuantity: number
  allocatedQuantity: number
  price: number
  total: number
}

export interface BillingPayment {
  id?: string
  code?: string
  billingsId: string
  paymentDate: string
  comment?: string | null
  oldAmount: number
  amount: number
  paymentMode?: PaymentMethodResponse
}

export interface PaymentMethodResponse {
  id: string
  code?: string
  libelle: string
  active: boolean
}

export interface PurchasePriceSupplierResponse {
  id: string
  productId: string
  thirdPartiesId: string
  reference: string
  tva: string | null
  currenciesId: string | null
  price: number | string | null
  discount: number | null
  deliveryTime: number | null
  product?: ProductResponse
  thirdParties?: ThirdParties
  createdAt?: string
  updatedAt?: string
}
