import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import DataClass from 'App/Models/DataClass'

export default class GenerateClassSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method

    await DataClass.createMany([
      {
        classCode: '01TPLP007'
      },
      {
        classCode: '02TPLP007'
      },
      {
        classCode: '03TPLP007'
      },
      {
        classCode: '04TPLP007'
      },
      {
        classCode: '05TPLP007'
      },
      {
        classCode: '06TPLP007'
      },
      {
        classCode: '07TPLP007'
      },
      {
        classCode: '08TPLP007'
      },
      
      {
        classCode: '01TPLP001'
      },
      {
        classCode: '02TPLP001'
      },
      {
        classCode: '03TPLP001'
      },
      {
        classCode: '04TPLP001'
      },
      {
        classCode: '05TPLP001'
      },
      {
        classCode: '06TPLP001'
      },
      {
        classCode: '07TPLP001'
      },
      {
        classCode: '08TPLP001'
      },


      {
        classCode: '01TPLP002'
      },
      {
        classCode: '02TPLP002'
      },
      {
        classCode: '03TPLP002'
      },
      {
        classCode: '04TPLP002'
      },
      {
        classCode: '05TPLP002'
      },
      {
        classCode: '06TPLP002'
      },
      {
        classCode: '07TPLP002'
      },
      {
        classCode: '08TPLP002'
      },

      {
        classCode: '01TPLP003'
      },
      {
        classCode: '02TPLP003'
      },
      {
        classCode: '03TPLP003'
      },
      {
        classCode: '04TPLP003'
      },
      {
        classCode: '05TPLP003'
      },
      {
        classCode: '06TPLP003'
      },
      {
        classCode: '07TPLP003'
      },
      {
        classCode: '08TPLP003'
      },
      

      {
        classCode: '01TPLP004'
      },
      {
        classCode: '02TPLP004'
      },
      {
        classCode: '03TPLP004'
      },
      {
        classCode: '04TPLP004'
      },
      {
        classCode: '05TPLP004'
      },
      {
        classCode: '06TPLP004'
      },
      {
        classCode: '07TPLP004'
      },
      {
        classCode: '08TPLP004'
      },


      {
        classCode: '01TPLP005'
      },
      {
        classCode: '02TPLP005'
      },
      {
        classCode: '03TPLP005'
      },
      {
        classCode: '04TPLP005'
      },
      {
        classCode: '05TPLP005'
      },
      {
        classCode: '06TPLP005'
      },
      {
        classCode: '07TPLP005'
      },
      {
        classCode: '08TPLP005'
      },


      {
        classCode: '01TPLP006'
      },
      {
        classCode: '02TPLP006'
      },
      {
        classCode: '03TPLP006'
      },
      {
        classCode: '04TPLP006'
      },
      {
        classCode: '05TPLP006'
      },
      {
        classCode: '06TPLP006'
      },
      {
        classCode: '07TPLP006'
      },
      {
        classCode: '08TPLP006'
      },


      {
        classCode: '01TPLP008'
      },
      {
        classCode: '02TPLP008'
      },
      {
        classCode: '03TPLP008'
      },
      {
        classCode: '04TPLP008'
      },
      {
        classCode: '05TPLP008'
      },
      {
        classCode: '06TPLP008'
      },
      {
        classCode: '07TPLP008'
      },
      {
        classCode: '08TPLP008'
      },
    ])
  }
}
