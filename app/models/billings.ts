import { BaseModel, beforeSave, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { BillingType } from './enum/product_enum.js'
import User from './user.js'
import { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import ThirdParties from './third_parties.js'
import Product from './product.js'
import BillingPayment from './billing_payment.js'

export default class Billings extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare code: string

  @column()
  declare refBillingSupplier: string | null

  @column()
  declare thirdPartiesId: string

  @column()
  declare type: string | null

  @column()
  declare description: string | null

  @column()
  declare billingDate: string | null

  @column()
  declare status: string

  @column()
  declare amountIncludingVat: string | null

  @column()
  declare amountExcludingVat: string | null

  @column()
  declare vatAmount: string | null

  @column()
  declare userId: string

  @column()
  declare remainingPrice: number | null

  @column()
  declare allocatedPrice: number | null

  @column()
  declare parentBillingId: string | null

  @column({ serializeAs: null })
  declare lastValue: number

  @column()
  declare isFullRefund: boolean | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User> | null

  @belongsTo(() => ThirdParties)
  declare thirdParties: BelongsTo<typeof ThirdParties> | null

  @manyToMany(() => Product, {
    localKey: 'id',
    pivotForeignKey: 'billings_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'product_id',
    pivotTable: 'billing_items',

    pivotColumns: ['id', 'quantity', 'price', 'total', 'discount', 'tva'],
  })
  declare billingItem: ManyToMany<typeof Product>

  @hasMany(() => Billings, {
    foreignKey: 'parentBillingId',
    localKey: 'id',
  })
  declare childrenBillings: HasMany<typeof Billings>

  @belongsTo(() => Billings, { foreignKey: 'parentBillingId' })
  declare parentBilling: BelongsTo<typeof Billings> | null

  @hasMany(() => BillingPayment)
  declare billingPayments: HasMany<typeof BillingPayment>

  @beforeSave()
  public static async generateCode(billing: Billings) {
    if (!billing.$isNew) return

    const year = DateTime.now().year.toString().slice(-2) // Get last 2 digits of the year
    const month = DateTime.now().toFormat('MM') // Get month in MM format
    const todayDate = `${month}${year}` // Format month and year (MMYY)

    // Retrieve the last billing payment and its sequence value
    const lastBilling = await Billings.query().orderBy('created_at', 'desc').first()

    let newBillingNumber = 1 // Start numbering at 1 by default
    if (lastBilling) {
      // Increment the last sequence value
      newBillingNumber = lastBilling.lastValue + 1
    }

    // Ensure the sequence number is always 4 digits with leading zeros
    const seqNumber = newBillingNumber.toString().padStart(4, '0')

    if (billing.type === BillingType.STANDARD_INVOICE) {
      billing.code = `FAC/${todayDate}-${seqNumber}`
    } else if (billing.type === BillingType.CREDIT_INVOICE) {
      billing.code = `FAA/${todayDate}-${seqNumber}`
    } else {
      billing.code = `FDI${todayDate}-${seqNumber}`
    }
  }
}
