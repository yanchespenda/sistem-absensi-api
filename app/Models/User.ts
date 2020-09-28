import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, column, hasMany, HasMany, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import RoleUser from './RoleUser'

export default class User extends BaseModel {
  public static table = 'users'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'username' })
  public username: string

  @column({ columnName: 'password', serializeAs: null })
  public password: string

  @column({ columnName: 'avatar' })
  public avatar: string

  @column.dateTime({ columnName: 'lastAttendedAt' })
  public lastAttendedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.hash(user.password)
    }
  }

  @hasMany(() => RoleUser, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public roleUser: HasMany<typeof RoleUser>
}
