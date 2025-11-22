import { BaseSchema } from '@adonisjs/lucid/schema'

export default class MovementsSchema extends BaseSchema {
  protected tableName = 'movements'
  protected sequenceName = 'movement_reference_seq'

  async up() {
    // Créer la séquence indépendamment avant de créer la table
    await this.schema.raw(`
      CREATE SEQUENCE IF NOT EXISTS ${this.sequenceName} START 1000;
    `)

    // Créer la table "movements" et utiliser la séquence créée
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.integer('reference').defaultTo(this.raw(`nextval('${this.sequenceName}')`))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('code').notNullable()
      table.uuid('stock_id').notNullable().references('id').inTable('stocks').onDelete('CASCADE')
      table.string('movement_quantity').notNullable()
      table.string('movement_type').notNullable()
      table.float('amount').nullable()
      table.timestamp('movement_date', { useTz: true })
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    // Supprimer la table "movements" et la séquence si elles existent
    this.schema.dropTable(this.tableName)
    await this.schema.raw(`DROP SEQUENCE IF EXISTS ${this.sequenceName};`)
  }
}
