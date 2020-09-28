import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import DataClass from './DataClass'

export default class DataClassUser extends BaseModel {
  public static table = 'data_class_users'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'class_id' })
  public classId: number

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => DataClass, {
    localKey: 'id',
    foreignKey: 'classId',
  })
  public class: BelongsTo<typeof DataClass>
}
