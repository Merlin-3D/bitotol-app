import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'billing_payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('billings_id')
        .notNullable()
        .references('id')
        .inTable('billings')
        .onDelete('CASCADE')
      table.string('code').nullable().unique()
      table.string('payment_mode').nullable()
      table.string('payment_date').nullable()
      table.string('account_number').nullable()
      table.string('comment').nullable()
      table.float('old_amount').nullable().defaultTo(0)
      table.float('amount').nullable().defaultTo(0)
      table.increments('last_value')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
