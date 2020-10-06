import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WebOptions extends BaseSchema {
  protected tableName = 'web_options'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('option_name').index()
      table.text('option_value')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
