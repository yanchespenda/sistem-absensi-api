import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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

  @column({ columnName: 'course_id' })
  public courseId: number

  @column({ columnName: 'storage_id' })
  public storageId: string
}
