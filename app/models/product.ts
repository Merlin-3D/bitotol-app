import { BaseModel, beforeSave, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Warehouses from './warehouses.js'
import User from './user.js'
import Stock from './stock.js'
import { ProductType } from './enum/product_enum.js'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reference: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare warehousesId: string | null

  @column()
  declare active: boolean

  @column()
  declare userId: string

  @column()
  declare limitStockAlert: number | null

  @column()
  declare optimalStock: number | null

  @column()
  declare sellingPrice: number | null

  @column()
  declare expiredAt: string | null

  @column()
  declare type: ProductType | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Warehouses, {
    foreignKey: 'warehousesId',
  })
  declare warehouse: BelongsTo<typeof Warehouses> | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User> | null

  @hasMany(() => Stock)
  declare stock: HasMany<typeof Stock>

  @beforeSave()
  static async generateClientCode(product: Product) {
    if (!product.reference) {
      const currentDate = new Date()
      const year = DateTime.now().year.toString().slice(-2) // Get last 2 digits of the year
      const month = DateTime.now().toFormat('MM') // Get month in MM format
      const todayDate = `${month}${year}` // Format month and year (MMYY)

      const seconds = currentDate.getMilliseconds().toString().padStart(4, '0')
      const existingCustomerCount = seconds

      const customerNumber = existingCustomerCount.toString().padStart(4, '0')

      product.reference = `${product.type === 'P' ? 'P' : 'S'}/${todayDate}-${customerNumber}`
    }
  }
}
