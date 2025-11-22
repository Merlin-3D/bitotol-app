import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { BelongsTo } from '@adonisjs/lucid/types/relations'
import Stock from './stock.js'
import User from './user.js'

export default class Movement extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare reference: string | null

  @column()
  declare stockId: string

  @column()
  declare title: string

  @column()
  declare code: string

  @column()
  declare movementQuantity: string

  @column()
  declare movementType: string

  @column()
  declare userId: string

  @column()
  declare amount: number | null

  @column.dateTime({ autoCreate: true })
  declare movementDate: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Stock)
  declare stock: BelongsTo<typeof Stock> | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User> | null
}
