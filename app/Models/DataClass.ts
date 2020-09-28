import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import DataClassUser from './DataClassUser'

export default class DataClass extends BaseModel {
  public static table = 'data_classes'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'kode_kelas' })
  public classCode: string

  @hasMany(() => DataClassUser, {
    localKey: 'id',
    foreignKey: 'classId',
  })
  public roleUser: HasMany<typeof DataClassUser>
}
