import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class RoleSeeder extends BaseSeeder {
  public async run () {
    await Role.createMany([
      {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrator',
      },
      {
        name: 'Staff',
        slug: 'staff',
        description: 'Staff',
      },
      {
        name: 'Karyawan',
        slug: 'karyawan',
        description: 'Karyawan / Karyawati',
      },
    ])

  }
}
