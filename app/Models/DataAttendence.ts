import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Storage from './Storage'

export default class DataAttendence extends BaseModel {
  public static table = 'data_attendances'

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

  @column({ columnName: 'attend_type' })
  public attendType: number

  @hasOne(() => Storage, {
    localKey: 'storageId',
    foreignKey: 'id',
  })
  public storageData: HasOne<typeof Storage>
}
