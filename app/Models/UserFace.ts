import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Storage from './Storage'

export default class UserFace extends BaseModel {
  public static table = 'user_faces'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'storage_id' })
  public storageId: number

  @column({ columnName: 'active' })
  public active: boolean

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @hasOne(() => Storage, {
    localKey: 'storageId',
    foreignKey: 'id',
  })
  public storageData: HasOne<typeof Storage>
}
