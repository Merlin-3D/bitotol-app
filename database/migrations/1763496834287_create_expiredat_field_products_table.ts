import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'
  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('expired_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('expired_at')
    })
  }
}
