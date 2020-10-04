import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DataAttendances extends BaseSchema {
  protected tableName = 'data_attendances'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().index()
      table.integer('storage_id').unsigned()
      table.integer('attend_type', 2).unsigned().defaultTo(1)
      table.timestamps(true)

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
      table.foreign('storage_id').references('id').inTable('storages').onDelete('SET NULL').onUpdate('NO ACTION')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
