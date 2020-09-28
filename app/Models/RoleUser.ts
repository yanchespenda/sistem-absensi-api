import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Role from './Role'

export default class RoleUser extends BaseModel {
  public static table = 'role_users'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'role_id' })
  public roleId: number

  @column({ columnName: 'user_id' })
  public userId: number

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Role, {
    localKey: 'id',
    foreignKey: 'roleId',
  })
  public role: BelongsTo<typeof Role>

}
