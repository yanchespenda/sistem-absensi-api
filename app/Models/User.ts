import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, column, hasMany, HasMany, beforeSave, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import RoleUser from './RoleUser'
import Storage from './Storage'

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
  public avatar: number

  @column.dateTime({ columnName: 'lastAttendedAt' })
  public lastAttendedAt: DateTime

  @column.dateTime({ columnName: 'lastLoggedAt' })
  public lastLoggedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @hasOne(() => Storage, {
    localKey: 'avatar',
    foreignKey: 'id',
  })
  public storageAvatar: HasOne<typeof Storage>

  @hasMany(() => RoleUser, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public roleUser: HasMany<typeof RoleUser>
}
