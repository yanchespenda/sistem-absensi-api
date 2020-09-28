import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import DataCourse from './DataCourse'

export default class DataCourseUser extends BaseModel {
  public static table = 'data_course_users'

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

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => DataCourse, {
    localKey: 'id',
    foreignKey: 'courseId',
  })
  public class: BelongsTo<typeof DataCourse>
}
