import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('reference').notNullable().unique()
      table.string('name').notNullable()
      table.text('description').nullable()
      table
        .uuid('warehouses_id')
        .nullable()
        .references('id')
        .inTable('warehouses')
        .onDelete('CASCADE')
      table.boolean('active').defaultTo(true)
      table.integer('limit_stock_alert').nullable()
      table.integer('optimal_stock').nullable()
      table.integer('selling_price').defaultTo(0).nullable()
      table.uuid('user_id').notNullable().references('id').inTable('users')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
