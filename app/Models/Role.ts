import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import RoleUser from './RoleUser'

export default class Role extends BaseModel {
  public static table = 'roles'

  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column({ columnName: 'name' })
  public name: string

  @column({ columnName: 'slug' })
  public slug: string

  @column({ columnName: 'description' })
  public description: string

  @hasMany(() => RoleUser, {
    localKey: 'id',
    foreignKey: 'roleId',
  })
  public roleUser: HasMany<typeof RoleUser>
}
