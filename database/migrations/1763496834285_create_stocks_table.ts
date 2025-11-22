import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table
        .uuid('warehouses_id')
        .notNullable()
        .references('id')
        .inTable('warehouses')
        .onDelete('CASCADE')
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.integer('unit_purchase_price').notNullable()
      table.integer('physical_quantity').notNullable()
      table.integer('virtual_quantity').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
