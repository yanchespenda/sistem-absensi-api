import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserFaces extends BaseSchema {
  protected tableName = 'user_faces'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().index()
      table.string('storage_id').notNullable()
      table.timestamps(true)

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
