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
      const year = currentDate.getFullYear().toString().slice(-2) // les deux derniers chiffres de l'année
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0') // mois avec deux chiffres

      const seconds = currentDate.getMilliseconds().toString().padStart(4, '0')
      const existingCustomerCount = seconds

      const customerNumber = existingCustomerCount.toString().padStart(2, '0')

      warehouse.reference = `WA/${year}${month}B${customerNumber}`
    }
  }
}
