import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RoleUsers extends BaseSchema {
  protected tableName = 'role_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('role_id').unsigned().notNullable().index()
      table.integer('user_id').unsigned().notNullable().index()
      table.timestamps(true)

      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE').onUpdate('RESTRICT')
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('RESTRICT')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
