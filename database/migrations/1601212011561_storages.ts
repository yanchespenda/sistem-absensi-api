import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Storages extends BaseSchema {
  protected tableName = 'storages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('public_id').notNullable().index()
      table.jsonb('raw').notNullable()
      table.timestamps(true)
      
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
