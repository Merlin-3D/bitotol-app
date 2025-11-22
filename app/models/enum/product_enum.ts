export enum SalesStatus {
  ON_SALE = 'on sale',
  OFF_SALE = 'off sale',
  NONE = 'none',
}

export enum PurchaseStatus {
  IN_PURCHASE = 'in purchase',
  EXCLUDING_SALE = 'excluding sale',
  NONE = 'none',
}

export enum TaxType {
  HT = 'HT',
  TTC = 'TTC',
}

export enum ProductType {
  PRODUCT = 'P',
  SERVICE = 'S',
}

export enum MovementType {
  ENTER = 'enter',
  OUT = 'out',
  RECEPTION = 'reception',
  RECEPTION_OUT = 'reception-out',
  SHIPPING = 'shipping',
  SHIPPING_CREATE = 'shipping-create',
  SHIPPING_CANCEL = 'shipping-cancel',
  CORRECTION = 'correction',
}

export enum SupplierOrderStatus {
  DRAFT = 'Draft', // brouillon
  VALIDATE = 'Validate', // valider
  SENT = 'Sent', // envoyée
  RECEIVED = 'Received', // reçu
  PARTIALLY_RECEIVED = 'Partially Received', //partiellement reçu
  COMPLETED = 'Completed', //complétée
  CANCEL = 'Cancel', //Annuler
  RETURN = 'Return', //Retour
}

export enum BusinessProposalStatus {
  DRAFT = 'Draft', // brouillon
  VALIDATE = 'Validate', // valider
  SIGNED = 'signed', // signée
  UNSIGNED = 'unsigned', // non signée
}

export enum ShippingStatus {
  DRAFT = 'Draft', // brouillon
  VALIDATE = 'Validate', // valider
  COMPLETED = 'Completed', //complétée
  CANCEL = 'Cancel', //Annuler
}

export enum OrderType {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  SHIPPING = 'shipping',
}

export enum BillingStatus {
  DRAFT = 'Draft', //
  VALIDATE = 'Validate', //
  ABANDONED = 'Abandoned', //
  BEGIN = 'Begin', //
  PAID_PARTIALLY = 'Paid Partially', //
  PAID = 'Paid', //
  CREDIT_BACK = 'Credit Back',
}

export enum BillingType {
  STANDARD_INVOICE = 'SI', //
  DEPOSITE_INVOICE = 'DI', //
  CREDIT_INVOICE = 'CI', //
}
