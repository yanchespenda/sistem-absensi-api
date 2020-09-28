import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import DataCourseUser from './DataCourseUser'
import User from './User'

export default class DataCourse extends BaseModel {
  public static table = 'data_courses'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'kode_matkul' })
  public courseCode: string

  @column({ columnName: 'nama_matkul' })
  public courseName: number

  @column({ columnName: 'user_id' })
  public userId: number

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => DataCourseUser, {
    localKey: 'id',
    foreignKey: 'courseId',
  })
  public roleUser: HasMany<typeof DataCourseUser>
}
