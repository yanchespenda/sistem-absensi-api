import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'

import fs from 'fs'
import jwt from 'jsonwebtoken'
import path from 'path'
import bcrypt from 'bcrypt'

const rootDir = path.join(process.cwd())
// const saltRounds = 10
const tokenPrivate = path.join(rootDir, 'secret.key')
const privateKey = fs.readFileSync(tokenPrivate)

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

        const match = await bcrypt.compare(password, username);

        if(!match) {
            return response.badRequest({
                message: "Credential failed"
            })
        }

        return response.json({
            message: "Success",
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

        const userData = {
            username,
        }

        const token = jwt.sign({ subject: userData }, privateKey, { algorithm: 'RS256', expiresIn: '12h' });

        return response.json({
            message: "Success",

            token
        })
    }
}
