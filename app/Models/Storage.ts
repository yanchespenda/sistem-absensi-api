import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import DataAttendence from './DataAttendence'
import UserFace from './UserFace'

export default class Storage extends BaseModel {
  public static table = 'storages'
  
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'public_id' })
  public publicId: string

  @column({ columnName: 'raw' })
  public raw: string

  @beforeSave()
  public static async stringifyRaw (storage: Storage) {
    if (storage.$dirty.raw) {
      storage.raw = JSON.stringify(storage.raw)
    }
  }

  @belongsTo(() => User, {
    localKey: 'avatar',
    foreignKey: 'id',
  })
  public userAvatar: BelongsTo<typeof User>

  @belongsTo(() => DataAttendence, {
    localKey: 'storageId',
    foreignKey: 'id',
  })
  public dataAttendence: BelongsTo<typeof DataAttendence>

  @belongsTo(() => UserFace, {
    localKey: 'storageId',
    foreignKey: 'id',
  })
  public dataUserFace: BelongsTo<typeof UserFace>
}
