import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DataClasses extends BaseSchema {
  protected tableName = 'data_classes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('kode_kelas').notNullable().index()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
