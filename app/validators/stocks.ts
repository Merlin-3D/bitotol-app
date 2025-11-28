import { MovementType, ProductType } from '#models/enum/product_enum'
import vine from '@vinejs/vine'

export const warehouseStore = vine.compile(
  vine.object({
    name: vine.string(),
    address: vine.string().nullable().optional(),
    phone: vine.string().nullable().optional(),
    description: vine.string().nullable().optional(),
  })
)

export const productStore = vine.compile(
  vine.object({
    name: vine.string(),
    type: vine.enum(ProductType).optional(),
    description: vine.string().nullable().optional(),
    warehousesId: vine.string().nullable().optional(),
    limitStockAlert: vine.number().nullable().optional(),
    optimalStock: vine.number().nullable().optional(),
    sellingPrice: vine.number().nullable().optional(),
    expiredAt: vine.string().nullable().optional(),
  })
)

export const stockStore = vine.compile(
  vine.object({
    productId: vine.string(),
    warehousesId: vine.string(),
    quantity: vine.string(),
    unitPurchasePrice: vine.number(),
    physicalQuantity: vine.number(),
    virtualQuantity: vine.number(),
    type: vine.enum(MovementType),
    title: vine.string(),
  })
)

export const movementStore = vine.compile(
  vine.object({
    stocks: vine.array(vine.string()),
  })
)

export const transferStockStore = vine.compile(
  vine.object({
    title: vine.string(),
    productId: vine.string(),
    quantity: vine.number(),
    sourceWarehousesId: vine.string(),
    destinationWarehousesId: vine.string(),
    userId: vine.string(),
  })
)

export const purchasePriceStore = vine.compile(
  vine.object({
    productId: vine.string(),
    thirdPartiesId: vine.string(),
    reference: vine.string(),
    tva: vine.string().nullable(),
    currenciesId: vine.string().nullable(),
    price: vine.number(),
    discount: vine.number().nullable(),
    deliveryTime: vine.number().nullable(),
  })
)

export const BillingsStore = vine.compile(
  vine.object({
    thirdPartiesId: vine.string(),
    type: vine.string(),
    description: vine.string().nullable().optional(),
    billingDate: vine.string(),
    status: vine.string().optional(),
  })
)

export const BillingsCreditStore = vine.compile(
  vine.object({
    refBillingSupplier: vine.string().nullable().optional(),
    isFullRefund: vine.boolean(),
    thirdPartiesId: vine.string(),
    type: vine.string(),
    description: vine.string().nullable(),
    billingDate: vine.string(),
    status: vine.string(),
    amountIncludingVat: vine.string().nullable(),
    amountExcludingVat: vine.string().nullable(),
    vatAmount: vine.string().nullable(),
    // allocatedPrice: vine.number().nullable(),
    // remainingPrice: vine.number().nullable(),
    userId: vine.string(),
    parentBillingId: vine.string().optional(),
    billingItem: vine.array(
      vine.object({
        productId: vine.string(),
        quantity: vine.number(),
        price: vine.number(),
        total: vine.number(),
        discount: vine.number().nullable(),
        tva: vine.string().nullable(),
      })
    ),
  })
)

export const BillingsCreditStatus = vine.compile(
  vine.object({
    parentBillingId: vine.string(),
  })
)

// export const BillingsUpdate = vine.compile(
//   vine.object({
//     refBillingSupplier: vine.string().optional(),
//     libelle: vine.string().nullable(),
//     billingDate: vine.string(),
//     paymentModeId: vine.string().nullable(),
//     paymentTermId: vine.string().nullable(),
//     paymentDeadline: vine.string(),
//     currenciesId: vine.string().nullable(),
//     status: vine.string(),
//     type: vine.string(),
//     fileName: vine.string().nullable(),
//   })
// )

// export const BillingItemCreate = vine.compile(
//   vine.object({
//     thirdPartiesId: vine.string(),
//     productId: vine.string(),
//     billingsId: vine.string(),
//     tva: vine.string().nullable(),
//     price: vine.number(),
//     discount: vine.number().nullable(),
//     quantity: vine.number(),
//   })
// )

// export const BillingItemUpdate = vine.compile(
//   vine.object({
//     tva: vine.string().nullable(),
//     price: vine.number(),
//     discount: vine.number().nullable(),
//     quantity: vine.number(),
//   })
// )

// export const BillingPaymentCreate = vine.compile(
//   vine.object({
//     billingsId: vine.string(),
//     paymentModeId: vine.string(),
//     paymentDate: vine.string(),
//     accountNumber: vine.string().nullable(),
//     comment: vine.string().nullable(),
//     oldAmount: vine.number(),
//     amount: vine.number(),
//   })
// )

// export const BusinessProposalStore = vine.compile(
//   vine.object({
//     thirdPartiesId: vine.string(),
//     refCustomer: vine.string(),
//     userId: vine.string(),
//     status: vine.enum(BusinessProposalStatus),
//     businessDate: vine.string().nullable(),
//     duration: vine.string().nullable(),
//     paymentModeId: vine.string().nullable(),
//     paymentTermId: vine.string().nullable(),
//     currenciesId: vine.string().nullable(),
//     fileName: vine.string().nullable().optional(),
//   })
// )

// export const BusinessProposalItemCreate = vine.compile(
//   vine.object({
//     thirdPartiesId: vine.string(),
//     designation: vine.string().nullable(),
//     productId: vine.string().nullable(),
//     businessProposalId: vine.string(),
//     duration: vine.number().nullable(),
//     tva: vine.string().nullable(),
//     price: vine.number(),
//     discount: vine.number().nullable(),
//     quantity: vine.number(),
//   })
// )

// export const BusinessProposalItemUpdate = vine.compile(

// export const BillingsStore = vine.compile(
//   vine.object({
//     refBillingSupplier: vine.string().optional(),
//     thirdPartiesId: vine.string(),
//     orderId: vine.string().nullable(),
//     businessProposalId: vine.string().nullable().optional(),
//     shippingsId: vine.string().nullable(),
//     type: vine.string(),
//     thirdPartiesType: vine.enum(OrderType),
//     libelle: vine.string().nullable(),
//     billingDate: vine.string(),
//     paymentModeId: vine.string().nullable(),
//     paymentTermId: vine.string().nullable(),
//     paymentDeadline: vine.string(),
//     currenciesId: vine.string().nullable(),
//     status: vine.string(),
//     amountIncludingVat: vine.string().nullable(),
//     amountExcludingVat: vine.string().nullable(),
//     vatAmount: vine.string().nullable(),
//     userId: vine.string(),
//     fileName: vine.string().nullable(),
//   })
// )

// export const BillingsCreditStore = vine.compile(
//   vine.object({
//     refBillingSupplier: vine.string().nullable().optional(),
//     isFullRefund: vine.boolean(),
//     thirdPartiesId: vine.string(),
//     orderId: vine.string().nullable(),
//     shippingsId: vine.string().nullable(),
//     type: vine.string(),
//     thirdPartiesType: vine.enum(OrderType),
//     libelle: vine.string().nullable(),
//     billingDate: vine.string(),
//     paymentModeId: vine.string().nullable(),
//     paymentTermId: vine.string().nullable(),
//     paymentDeadline: vine.string(),
//     currenciesId: vine.string().nullable(),
//     status: vine.string(),
//     amountIncludingVat: vine.string().nullable(),
//     amountExcludingVat: vine.string().nullable(),
//     vatAmount: vine.string().nullable(),
//     allocatedPrice: vine.number().nullable(),
//     remainingPrice: vine.number().nullable(),
//     userId: vine.string(),
//     fileName: vine.string().nullable(),
//     parentBillingId: vine.string().optional(),
//     billingItem: vine.array(
//       vine.object({
//         productId: vine.string(),
//         quantity: vine.number(),
//         price: vine.number(),
//         total: vine.number(),
//         discount: vine.number().nullable(),
//         tva: vine.string().nullable(),
//       })
//     ),
//   })
// )

// export const BillingsCreditStatus = vine.compile(
//   vine.object({
//     parentBillingId: vine.string(),
//   })
// )

export const BillingsUpdate = vine.compile(
  vine.object({
    refBillingSupplier: vine.string().optional(),
    description: vine.string().nullable(),
    billingDate: vine.string(),
    status: vine.string(),
    type: vine.string(),
  })
)

export const BillingItemCreate = vine.compile(
  vine.object({
    thirdPartiesId: vine.string(),
    productId: vine.string(),
    billingsId: vine.string(),
    tva: vine.string().nullable(),
    price: vine.number(),
    discount: vine.number().nullable(),
    quantity: vine.number(),
  })
)

export const BillingItemUpdate = vine.compile(
  vine.object({
    tva: vine.string().nullable(),
    price: vine.number(),
    discount: vine.number().nullable(),
    quantity: vine.number(),
  })
)

export const BillingPaymentCreate = vine.compile(
  vine.object({
    billingsId: vine.string(),
    paymentDate: vine.string(),
    comment: vine.string().nullable(),
    oldAmount: vine.number(),
    amount: vine.number(),
  })
)

// export const BusinessProposalStore = vine.compile(
//   vine.object({
//     thirdPartiesId: vine.string(),
//     refCustomer: vine.string(),
//     userId: vine.string(),
//     status: vine.enum(BusinessProposalStatus),
//     businessDate: vine.string().nullable(),
//     duration: vine.string().nullable(),
//     paymentModeId: vine.string().nullable(),
//     paymentTermId: vine.string().nullable(),
//     currenciesId: vine.string().nullable(),
//     fileName: vine.string().nullable().optional(),
//   })
// )

// export const BusinessProposalItemCreate = vine.compile(
//   vine.object({
//     thirdPartiesId: vine.string(),
//     designation: vine.string().nullable(),
//     productId: vine.string().nullable(),
//     businessProposalId: vine.string(),
//     duration: vine.number().nullable(),
//     tva: vine.string().nullable(),
//     price: vine.number(),
//     discount: vine.number().nullable(),
//     quantity: vine.number(),
//   })
// )

// export const BusinessProposalItemUpdate = vine.compile(
//   vine.object({
//     designation: vine.string().nullable(),
//     duration: vine.number().nullable(),
//     tva: vine.string().nullable(),
//     price: vine.number(),
//     discount: vine.number().nullable(),
//     quantity: vine.number(),
//   })
// )
