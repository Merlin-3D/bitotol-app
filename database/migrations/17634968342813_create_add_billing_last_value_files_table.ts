import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'billings'
  protected sequenceName = 'billings_last_value_seq'

  async up() {
    // Créer la séquence en premier
    await this.schema.raw(`
      CREATE SEQUENCE IF NOT EXISTS ${this.sequenceName} START WITH 1 INCREMENT BY 1;
    `)

    // Ajouter la colonne `last_value` après la création de la séquence
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('last_value').defaultTo(this.raw(`nextval('${this.sequenceName}')`))
    })
  }

  async down() {
    // Supprimer la colonne last_value
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('last_value')
    })

    // Supprimer la séquence
    await this.schema.raw(`DROP SEQUENCE IF EXISTS ${this.sequenceName};`)
  }
}
