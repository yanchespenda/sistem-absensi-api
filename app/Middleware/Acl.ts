import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RoleUser from 'App/Models/RoleUser'
import Role from 'App/Models/Role'
// import Role from 'App/Models/Role'

export default class AclMiddleware {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>, allowedAcl: string[],) {

    const getAuth = ctx.request.auth
    if (!getAuth) {
      return ctx.response.internalServerError({
        message: 'Acl middleware required auth'
      })
    }

    if (!getAuth.userId) {
      return ctx.response.forbidden({
        message: 'Token not valid'
      })
    }

    let isAll = false
    allowedAcl.forEach(acl => {
      if (acl === 'all') {
        isAll = true
      }
    })
    
    let getRole: Role[]
    if (isAll) {
      getRole = await Role.query().select(['id', 'slug'])
    } else {
      getRole = await Role.query().whereIn('slug', allowedAcl).select(['id', 'slug'])

      if (getRole.length === 0) {
        return ctx.response.internalServerError({
          message: 'Role not found'
        })
      }

      if (getRole.length !== allowedAcl.length) {
        return ctx.response.internalServerError({
          message: 'Some role not found'
        })
      }
    }

    const joinRoleId = getRole.map(data => data.id)
    const getRoleUser = await RoleUser.query().where('userId', getAuth.userId).whereIn('roleId', joinRoleId).select(['id', 'userId', 'roleId'])
    if (getRoleUser.length === 0) {
      return ctx.response.forbidden({
        message: 'You does not have permission'
      })
    }

    let currentRole: any = []
    getRoleUser.forEach(item => {
      const role = getRole.find(role => role.id === item.roleId)
      if (role) {
        currentRole.push(role.toObject())
      }
    })

    ctx.request.roles = currentRole

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
