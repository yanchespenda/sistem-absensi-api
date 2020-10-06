import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import WebOption from 'App/Models/WebOption'
// import { DateTime } from 'luxon'

export default class WebOptionSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method

    const attedanceIn = {
      minH: 8,
      minM: 0,
      maxH: 9,
      maxM: 0
    }
    const attedanceOut = {
      minH: 16,
      minM: 0,
      maxH: 18,
      maxM: 0
    }
    const attendanceDay = {
      1: true,
      2: true,
      3: true,
      4: true,
      5: true,
      6: false,
      7: false
    }

    await WebOption.createMany([
      {
        optionName: 'attedance-in',
        optionValue: JSON.stringify(attedanceIn)
      },
      {
        optionName: 'attedance-out',
        optionValue: JSON.stringify(attedanceOut)
      },
      {
        optionName: 'attedance-days',
        optionValue: JSON.stringify(attendanceDay)
      },
    ])
  }
}
