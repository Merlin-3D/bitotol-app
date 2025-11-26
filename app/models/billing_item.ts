import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Product from './product.js'
import { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class BillingItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare billingsId: string

  @column()
  declare productId: string

  @column()
  declare quantity: number

  @column()
  declare price: number

  @column()
  declare total: number

  @column()
  declare discount: number | null

  @column()
  declare tva: string | null

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
