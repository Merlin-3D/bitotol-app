import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'billings'
  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('parent_billing_id')
        .nullable()
        .references('id')
        .inTable('billings')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('parent_billing_id')
        .nullable()
        .references('id')
        .inTable('billings')
        .onDelete('CASCADE')
    })
  }
}
