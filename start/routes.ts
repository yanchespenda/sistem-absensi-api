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

Route.get('/', async () => {
  return { 
    message: "Hello, welcome in Face Recognition API",
  }
})

Route.group(() => {
  Route.post('/signin', 'AuthController.signin')
  Route.post('/signup', 'AuthController.signup')

  Route.get('/me', 'AuthController.whoAmI').middleware('auth').middleware('acl:admin,mahasiswa')
}).prefix('auth')

Route.group(() => {
  Route.post('/verify', 'ApisController.verify')

  Route.group(() => {
    Route.post('/avatar', 'UsersController.uploadAvatar')
    Route.post('/face', 'UsersController.uploadFace')
    Route.post('/face/url', 'UsersController.faceUrl')
  }).prefix('user')
}).prefix('api').middleware('auth')
