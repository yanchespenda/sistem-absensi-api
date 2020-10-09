import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TokenManagement from 'App/Helpers/TokenManagement'

import User from 'App/Models/User'

export default class AuthMiddleware {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {

    const getBarearToken = ctx.request.header('authorization')

    if (!getBarearToken) {
      return ctx.response.forbidden({
        message: 'Authorization token missing'
      })
    }

    const parseToken = getBarearToken.split(' ')
    if (parseToken.length !== 2 || parseToken[0] != 'Bearer') {
      return ctx.response.forbidden({
        message: 'Invalid token'
      })
    }

    const token = parseToken[1]

    let decoded: any
    try {
      const tokenManagement = new TokenManagement()
      decoded = tokenManagement.verify(token)
      if (!decoded.user) {
        throw 'Invalid token'
      }
    } catch(err) {
      return ctx.response.unauthorized({
        message: 'Invalid token'
      })
    }

    const getUserId = decoded.user.userId || 0
    const userVerify = await User.find(getUserId)
    if (!userVerify) {
      return ctx.response.unauthorized({
        message: 'Invalid token'
      })
    }

    decoded.user.token = token
    ctx.request.auth = decoded.user

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
