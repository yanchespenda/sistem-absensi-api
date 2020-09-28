import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DataCourses extends BaseSchema {
  protected tableName = 'data_courses'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('kode_matkul').notNullable().index()
      table.string('nama_matkul').notNullable()
      table.integer('user_id').unsigned().notNullable().index() // Dosen
      table.timestamps(true)

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
