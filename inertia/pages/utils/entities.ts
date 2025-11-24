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
  limitStockAlert?: number | string | null
  sellingPrice?: number | string | null
  optimalStock?: number | string | null
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
