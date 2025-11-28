import { BaseModel, beforeSave, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class Warehouses extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reference: string

  @column()
  declare name: string

  @column()
  declare address: string | null

  @column()
  declare phone: string | null

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeSave()
  static async generateClientCode(warehouse: Warehouses) {
    if (!warehouse.reference) {
      const currentDate = new Date()
      const year = DateTime.now().year.toString().slice(-2) // Get last 2 digits of the year
      const month = DateTime.now().toFormat('MM') // Get month in MM format
      const todayDate = `${month}${year}` // Format month and year (MMYY)

      const seconds = currentDate.getMilliseconds().toString().padStart(4, '0')
      const existingCustomerCount = seconds

      const customerNumber = existingCustomerCount.toString().padStart(4, '0')

      warehouse.reference = `WA/${todayDate}-${customerNumber}`
    }
  }
}
