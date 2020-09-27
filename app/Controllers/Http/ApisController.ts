import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'
import path from 'path'
import uuid from 'uuid'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

export default class ApisController {

    public async verify({ request, response }: HttpContextContract) {

        const validated = await request.validate({
            schema: schema.create({
                user: schema.string(),
                resources: schema.file({
                    size: '2mb',
                    extnames: ['jpg', 'png', 'jpeg'],
                }),
                verify: schema.file({
                    size: '2mb',
                    extnames: ['jpg', 'png', 'jpeg'],
                }),
            }),
            messages: {
                'user.required': 'User required',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing body"
            })
        }

        await validated.resources.move(Application.tmpPath('uploads'))
        await validated.verify.move(Application.tmpPath('uploads'))

        const resourceName = validated.resources.fileName || uuid.v4()
        const verifyName  = validated.verify.fileName || uuid.v4()

        const moveResource = path.join(Application.tmpPath('uploads'), resourceName)
        const moveVerify = path.join(Application.tmpPath('uploads'), verifyName)

        let axiosData
        try {
            const formData = new FormData()
            formData.append('resources', fs.createReadStream(moveResource))
            formData.append('verify', fs.createReadStream(moveVerify))

            axiosData = await axios.post("http://127.0.0.1:8000/verify", formData, { 
                headers: { 
                    'authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0Ijp7InVzZXJuYW1lIjoiaW52aW5zaWJsZSJ9LCJpYXQiOjE2MDExMzE2NTYsImV4cCI6MTYwMTE3NDg1Nn0.EP9UG1d73zaQahyE4QrOq5slTXHXnlRsQEqhCdr8SH_MXGnDG_q2nGHeWxjKtB9YPFDJ2KxTMa0bklsf3gpxHJFji7KJZorYFGXaSLjciU43trSJhfe8TuBPOucJD1whmSlxjJ27nar9PsaS4e0nLSbgMDgp0AaR2A3FcUIQMp_vs7hfT_weu-4MsSm35fLxJZREybZfE1t0muhFt_sa14rW_UV30B5pfu4QvwvEciPkL2cx8iG9SniklAP3GV6dCTN63RKoWwAVQJUqemlOCQJXuNgbVH2wtJquJr_twd-tvwTkh7NbE2z9UA9HFEcM047EFgtu__QgmwwsG9OnOw',
                    ...formData.getHeaders()
                } 
            })
        } catch (error) {
            console.log('error', error)
            return response.unprocessableEntity({
                message: "Something went wrong"
            })
        }

        return response.json({
            message: "Success",
            data: {
                result: axiosData.data,
                file: {
                    resource: moveResource,
                    verify: moveVerify,
                }
            }
        })
    }
}
