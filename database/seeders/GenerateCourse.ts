import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import DataCourse from 'App/Models/DataCourse'

export default class GenerateCourseSeeder extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method

    let courses: any = []
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL01' + classCode,
        courseName: 'Mata kuliah ' + 'TPL01' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL02' + classCode,
        courseName: 'Mata kuliah ' + 'TPL02' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL03' + classCode,
        courseName: 'Mata kuliah ' + 'TPL03' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL04' + classCode,
        courseName: 'Mata kuliah ' + 'TPL04' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL05' + classCode,
        courseName: 'Mata kuliah ' + 'TPL05' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL06' + classCode,
        courseName: 'Mata kuliah ' + 'TPL06' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL07' + classCode,
        courseName: 'Mata kuliah ' + 'TPL07' + classCode,
        userId: 6,
      })
    }
    for (let index = 0; index < 10; index++) {
      let classCode: string = index.toString()
      if (index < 10) {
        classCode = '0' + index
      }
      courses.push({
        courseCode: 'TPL08' + classCode,
        courseName: 'Mata kuliah ' + 'TPL08' + classCode,
        userId: 6,
      })
    }

    await DataCourse.createMany(courses)
  }
}
