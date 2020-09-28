import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class UserFace extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'storage_id' })
  public storageId: string

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>
}
