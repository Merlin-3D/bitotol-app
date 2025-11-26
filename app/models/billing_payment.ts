import { column, belongsTo, beforeSave, BaseModel } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { BelongsTo } from '@adonisjs/lucid/types/relations'
import Billings from './billings.js'

export default class BillingPayment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare code: string

  @column()
  declare billingsId: string

  @column()
  declare paymentMode: string | null

  @column()
  declare paymentDate: string | null

  @column()
  declare accountNumber: string | null

  @column()
  declare comment: string | null

  @column()
  declare oldAmount: number | null

  @column()
  declare amount: number | null

  @column()
  declare lastValue: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Billings)
  declare billings: BelongsTo<typeof Billings> | null

  @beforeSave()
  public static async generateCode(billingPayment: BillingPayment) {
    if (!billingPayment.$isNew) return

    const year = DateTime.now().year.toString().slice(-2) // Get last 2 digits of the year
    const month = DateTime.now().toFormat('MM') // Get month in MM format
    const todayDate = `${month}${year}` // Format month and year (MMYY)

    // Retrieve the last billing payment and its sequence value
    const lastBillingPayment = await BillingPayment.query().orderBy('created_at', 'desc').first()

    let newBillingPaymentNumber = 1 // Start numbering at 1 by default
    if (lastBillingPayment) {
      // Increment the last sequence value
      newBillingPaymentNumber = lastBillingPayment.lastValue + 1
    }

    // Ensure the sequence number is always 4 digits with leading zeros
    const seqNumber = newBillingPaymentNumber.toString().padStart(4, '0')

    // Generate the final code, e.g., SPAYMMYY-0001
    billingPayment.code = `SPAY${todayDate}-${seqNumber}`
  }
}
