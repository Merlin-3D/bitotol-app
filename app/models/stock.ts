import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { BelongsTo } from '@adonisjs/lucid/types/relations'
import Warehouses from './warehouses.js'
import Product from './product.js'
import User from './user.js'

export default class Stock extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare productId: string

  @column()
  declare warehousesId: string

  @column()
  declare userId: string

  @column()
  declare unitPurchasePrice: number

  @column()
  declare physicalQuantity: number

  @column()
  declare virtualQuantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Warehouses)
  declare warehouse: BelongsTo<typeof Warehouses> | null

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product> | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User> | null
}
