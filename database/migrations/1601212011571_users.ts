import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('username').unique().notNullable()
      table.string('password').notNullable()
      table.integer('avatar').unsigned()
      table.timestamp('lastLoggedAt')
      table.timestamp('lastAttendedAt')
      table.timestamps(true)

      table.foreign('avatar').references('id').inTable('storages').onDelete('SET NULL').onUpdate('NO ACTION')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
