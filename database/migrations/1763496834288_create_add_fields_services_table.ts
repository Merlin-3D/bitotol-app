import { ProductType } from '#models/enum/product_enum'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', Object.values(ProductType)).defaultTo(ProductType.PRODUCT).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('type')
    })
  }
}
