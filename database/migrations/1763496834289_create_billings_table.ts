import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'billings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('code').nullable().unique()
      table.string('ref_billing_supplier').nullable()

      table.uuid('third_parties_id').nullable().references('id').inTable('third_parties')
      table.string('type').nullable()
      table.text('description').nullable()
      table.string('billing_date').nullable()
      table.string('status').notNullable()
      table.float('allocated_price').nullable().defaultTo(0)
      table.float('remaining_price').nullable().defaultTo(0)
      table.float('amount_including_vat').nullable().defaultTo(0) //montant TTC
      table.float('amount_excluding_vat').nullable().defaultTo(0) //montant HT
      table.float('vat_amount').nullable().defaultTo(0) //montant TVA
      table.uuid('user_id').notNullable().references('id').inTable('users')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
