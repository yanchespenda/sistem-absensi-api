import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import TokenManagement from 'App/Helpers/TokenManagement'

import MdlUser from '../../Models/User'
import MdlRoleUser from '../../Models/RoleUser'

import { DateTime } from "luxon"

export default class AuthController {

    public async signin({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                username: schema.string(),
                password: schema.string()
            }),
            messages: {
                'username.required': 'Username required',
                'password.required': 'Password required',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing input"
            })
        }

        const username = request.input('username')
        const password = request.input('password')

        const user = await MdlUser.findBy('username', username)
        if (!user) {
            return response.unprocessableEntity({
                message: "Credential failed"
            })
        }

        let match = false
        try {
            match = await Hash.verify(user.password, password);
        } catch (error) {
            console.log('err', error)
            return response.internalServerError({
                message: "Something went wrong",
                error
            })
        }

        if(!match) {
            return response.unprocessableEntity({
                message: "Credential failed"
            })
        }

        const userData = {
            userId: user.id,
        }

        let token = ''
        try {
            token = this.generateToken({ user: userData })
        } catch (error) {
            console.log('err', error)
            return response.internalServerError({
                message: "Something went wrong",
                error
            })
        }

        user.lastLoggedAt = DateTime.local()
        await user.save()

        return response.json({
            token
        })
    }

    public async signup({ request, response }: HttpContextContract) {

        const validated = await request.validate({
            schema: schema.create({
                username: schema.string()
            }),
            messages: {
                'username.required': 'Username required',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing input"
            })
        }

        const username = request.input('username')
        const password = request.input('password')

        const userUnique = await MdlUser.findBy('username', username)
        if (userUnique) {
            return response.unprocessableEntity({
                message: "Username has been used"
            })
        }

        const user = new MdlUser()
        user.username = username
        user.password = password
        await user.save()

        const roles = new MdlRoleUser()
        roles.userId = user.id
        roles.roleId = 3
        await roles.save()

        const userData = {
            userId: user.id,
        }

        let token = ''
        try {
            token = this.generateToken({ user: userData })
        } catch (error) {
            console.log('err', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        return response.json({
            token
        })
    }

    public async verify({ request, response }: HttpContextContract) {
        if (!request.auth) {
            return response.forbidden({
                message: "Auth failed"
            })
        }

        // await this.sleep(1000)

        return response.send({
            message: "OK"
        })
    }

    async sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        })
    } 

    public async whoAmI({ request, response }: HttpContextContract) {
        const getAuth = request.auth
        if (!getAuth) {
            return response.badRequest({
                message: "Missing auth"
            })
        }

        const getRoles = request.roles

        const getUserData = await MdlUser.find(getAuth.userId)

        return response.json({
            auth: getAuth,
            roles: getRoles,
            userData: getUserData
        })
    }

    private generateToken(payload: any) {
        const tokenManagement = new TokenManagement()
        try {
            const token = tokenManagement.hash(payload)
            return token
        } catch (error) {
            throw 'Generate token error'
        }
    }
}
