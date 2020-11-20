/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
// import { DateTime } from 'luxon'

Route.get('/', async () => {
  return { 
    message: "Hello, welcome in Face Recognition API",
  }
})

Route.group( () => {
  Route.post('/signin', 'AuthController.signin')
  Route.post('/signup', 'AuthController.signup')

  Route.get('/me', 'AuthController.verify').middleware('auth')

  // Route.get('/me', 'AuthController.whoAmI').middleware('auth').middleware('acl:admin,mahasiswa')
}).prefix('auth')

Route.group( () => {
  Route.post('/verify', 'ApisController.verify')

  Route.group( () => {
    Route.get('/sidenav', 'UsersController.sidenav').middleware('acl:all')
    Route.get('/me', 'UsersController.me')

    Route.post('/avatar', 'UsersController.uploadAvatar')
    Route.post('/avatar64', 'UsersController.uploadAvatarBase64') 

    Route.group( () => {
      Route.post('/', 'UsersController.uploadFace')
      Route.post('/url', 'UsersController.faceUrl')
    }).prefix('face')

    Route.group( () => {
      Route.post('/password', 'UsersController.password')
    }).prefix('setting')

  }).prefix('user')

  /* Admin */
  Route.group( () => {

    Route.group( () => {
      Route.get('/', 'Role/AdminsController.users')
      Route.get('/:id/edit', 'Role/AdminsController.userEdit').where('id', /^[0-9]+$/)
      Route.post('/:id/avatar', 'Role/AdminsController.userEditAvatar').where('id', /^[0-9]+$/)
      Route.post('/:id/save', 'Role/AdminsController.userEditSave').where('id', /^[0-9]+$/)
      Route.delete('/:id/delete', 'Role/AdminsController.userDelete').where('id', /^[0-9]+$/)
    }).prefix('user')
    

  }).prefix('admin').middleware('acl:admin')

  /* Karyawan */
  Route.group( () => {

    Route.get('/status', 'Role/KaryawansController.getAttedanceStatus')

    /* Attedance */
    Route.group( () => {

      Route.group( () => {
        Route.post('/', 'Role/KaryawansController.attedanceIn')
        Route.get('/check', 'Role/KaryawansController.attedanceInCheck')
      }).prefix('in')

      Route.group( () => {
        Route.post('/', 'Role/KaryawansController.attedanceOut')
      }).prefix('out')

    }).prefix('attedance')
    
    /* Face */
    Route.group( () => {

      Route.get('/', 'Role/KaryawansController.faceList')
      Route.group( () => {
        Route.post('status', 'Role/KaryawansController.faceStatus')
        Route.post('delete', 'Role/KaryawansController.faceDelete')
      }).prefix(':id').where('id', /^[0-9]+$/)

      Route.post('/new', 'Role/KaryawansController.faceAdd')
    }).prefix('face')

    /* History */
    Route.group( () => {
      Route.get('/', 'Role/KaryawansController.historyList')
      Route.post('/generate', 'Role/KaryawansController.historyGenerate')
    }).prefix('history')

  }).prefix('karyawan').middleware('acl:karyawan')

  /* Dashboard */
  Route.group( () => {
    Route.get('/', 'DashboardsController.index')
  }).prefix('dashboard').middleware('acl:all')

}).prefix('api').middleware('auth')

// api/karyawan/history


// const attadanceIn = {
//   minH: 8,
//   minM: 0,
//   maxH: 9,
//   maxM: 0
// }
// const attadanceOut = {
//   minH: 16,
//   minM: 0,
//   maxH: 18,
//   maxM: 0
// }
// const attadanceDay = {
//   1: true,
//   2: true,
//   3: true,
//   4: true,
//   5: true,
//   6: false,
//   7: false
// }

// Route.get('/test', async () => {
//   const getThisDay = DateTime.local().toFormat('E')

//   // Is this day enable
//   const enableDay = attadanceDay[getThisDay] ? attadanceDay[getThisDay] : false

//   // Is this day available to attandance
//   let enableAttadance = false
//   if (enableDay) {
//     const getNow = DateTime.local()
//     const getMinimum = DateTime.fromObject({hour: attadanceIn.minH, minute: attadanceIn.minM})
//     const getMaximum = DateTime.fromObject({hour: attadanceOut.maxH, minute: attadanceOut.maxM})

//     if (getNow > getMinimum && getNow < getMaximum) {
//       enableAttadance = true
//     }
//   }

  
  
//   return { 
//     message: "Work",
//     data: {
//       getThisDay,
//       enableDay,

//       enableAttadance
//     }
//   }
// })
