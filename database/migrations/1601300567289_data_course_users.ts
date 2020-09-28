import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class DataCourseUsers extends BaseSchema {
  protected tableName = 'data_course_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('course_id').unsigned().notNullable().index()
      table.integer('user_id').unsigned().notNullable().index()
      table.timestamps(true)

      table.foreign('course_id').references('id').inTable('data_courses').onDelete('CASCADE').onUpdate('RESTRICT')
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
