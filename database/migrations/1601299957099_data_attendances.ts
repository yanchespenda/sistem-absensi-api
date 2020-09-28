import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DataAttendances extends BaseSchema {
  protected tableName = 'data_attendances'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().index()
      table.integer('course_id').unsigned().notNullable().index()
      table.string('storage_id').notNullable()
      table.timestamps(true)

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
      table.foreign('course_id').references('id').inTable('data_courses').onDelete('CASCADE').onUpdate('RESTRICT')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
