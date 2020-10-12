import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import { schema } from '@ioc:Adonis/Core/Validator'

import { DateTime } from 'luxon'
import ImageManagement from 'App/Helpers/ImageManagement'
import axios from 'axios'
// import FormData from 'form-data'

import UserFace from 'App/Models/UserFace'
import User from 'App/Models/User'
import MdlStorage from '../../../Models/Storage'

const FACE_RECOG_API = 'https://api.face-recognition.arproject.web.id'
const MAX_FACE_DATA = 3

export default class KaryawansController {

    async getAttedanceStatus({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const userId = request.auth.userId
        const userStatus = await attedanceManagement.checkUserToday(userId)
        const getCurrentStatus = attedanceManagement.checkIfAvailable()

        return response.ok({
            attendAvailable: getCurrentStatus,
            userStatus
        })
    }

    async attedanceInCheck({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()

        const getValidateCheck = (await attedanceManagement.getAttadanceConfig()).checkValidateIn()

        return response.ok(getValidateCheck)
    }

    async attedanceIn({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                face: schema.string(),
            }),
            messages: {
                'face.required': 'Username required',
            }
        })

        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const userId = request.auth.userId
        const userStatus = await attedanceManagement.checkUserToday(userId)
        const getCurrentStatus = attedanceManagement.checkIfAvailable()

        if (!getCurrentStatus) {
            return response.ok({
                message: "Attedance unavailable today"
            })
        }

        if (userStatus.found) {
            if (userStatus.wasOut) {
                return response.ok({
                    message: "You already attended in"
                })
            }

            if (userStatus.wasIn) {
                return response.ok({
                    message: "You already attended in"
                })
            }
        }

        const face = validated.face

        const imageManagement = new ImageManagement()

        let resources: string[] = []
        const getUserFace = await UserFace.query().where('userId', userId).where('active', true).preload('storageData')
        if (getUserFace.length === 0) {
            return response.unprocessableEntity({
                message: "You dont have any active face"
            })
        }

        let upload
        try {
            upload = await imageManagement.uploadAttedance(face)
        } catch (error) {
            console.log('error', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        getUserFace.forEach(item => {
            const parseRaw = JSON.parse(item.storageData.raw)
            if (parseRaw) {
                resources.push(parseRaw.secure_url)
            }
        })

        let axiosData
        try {
            const formData = {
                verify: upload.secure_url,
                resources
            }

            axiosData = await axios.post(`${FACE_RECOG_API}/verify/url?detail=true`, formData, { 
                headers: {
                    'authorization': 'Bearer ' + request.auth.token,
                    'Content-Type': 'application/json'
                }
            })
        } catch (error) {
            try {
                await imageManagement.removeImage(upload.public_id)
            } catch (error) {
                console.log('error', error)
            }
            
            console.log('error', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        console.log('axios', axiosData.data)
        if (!axiosData.data.result) {
            try {
                await imageManagement.removeImage(upload.public_id)
            } catch (error) {
                console.log('error', error)
            }
            return response.ok({
                message: "Sorry, your photo does not match with your saved face"
            })
        }

        const getStorage = await MdlStorage.create({
            publicId: upload.public_id,
            raw: upload
        })

        const user = await User.find(userId)
        if (user) {
            user.lastAttendedAt = DateTime.local()
            await user.save()
        }

        try {
            await attedanceManagement.attedanceInUser(userId, getStorage.id)
        } catch (error) {
            console.log('error', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        return response.ok({
            message: "Thank you"
        })
    }

    async attedanceOutCheck({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()

        const getValidateCheck = (await attedanceManagement.getAttadanceConfig()).checkValidateOut()

        return response.ok(getValidateCheck)
    }

    async attedanceOut({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const userId = request.auth.userId
        const userStatus = await attedanceManagement.checkUserToday(userId)
        const getCurrentStatus = attedanceManagement.checkIfAvailable()

        const user = await User.find(userId)
        if (user) {
            user.lastAttendedAt = DateTime.local()
            await user.save()
        }

        if (!userStatus.wasIn && !getCurrentStatus) {
            return response.ok({
                message: "Attedance unavailable today"
            })
        }

        if (userStatus.found) {
            if (userStatus.wasOut) {
                return response.ok({
                    message: "You already attended out"
                })
            }
        }

        if (!userStatus.wasIn) {
            return response.ok({
                message: "You need attend in before attend out"
            })
        }

        try {
            await attedanceManagement.attedanceOutUser(userId)
        } catch (error) {
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        return response.ok({
            message: "Thank you"
        })
    }

    async faceList({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const imageManagement = new ImageManagement()

        let faceData: any = []
        const userId = request.auth.userId
        const userFace = await UserFace.query().where('userId', userId).preload('storageData')
        if (userFace.length > 0) {
            userFace.forEach(async item => {
                const storageParse = JSON.parse(item.storageData.raw)
                if (storageParse) {
                    const filename = item.storageData.publicId + '.' + storageParse.format
                    let face: any = ''
                    try {
                        face = await imageManagement.privateURL(filename, storageParse.version, {
                            width: 144,
                            height: 144,
                            crop: "fill"
                        })

                        faceData.push({
                            id: item.id,
                            face,
                            active: item.active,
                            createdAt: item.createdAt
                        })
                    } catch (error) {
                        
                    }
                }
                
            })
        }

        return response.ok(faceData)
    }

    async faceAdd({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const validated = await request.validate({
            schema: schema.create({
                face: schema.string(),
            }),
            messages: {
                'face.required': 'Face required',
            }
        })

        const face = validated.face
        if (!/data:image\//.test(face)) {
            return response.unprocessableEntity({
                message: "Face not valid"
            })
        }

        const userId = request.auth.userId
        const getUserFace = await UserFace.query().where('userId', userId).count('id as total')
        if (getUserFace[0].total >= MAX_FACE_DATA) {
            return response.unprocessableEntity({
                message: "Face data was attemp max"
            })
        }

        const imageManagement = new ImageManagement()

        let upload
        try {
            upload = await imageManagement.uploadFace(face)
        } catch (error) {
            console.log('error', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }
        
        const userFace = new UserFace()
        userFace.userId = userId

        const getStorage = await MdlStorage.create({
            publicId: upload.public_id,
            raw: upload
        })

        userFace.storageId = getStorage.id
        await userFace.save()

        return response.ok({
            message: "Face added"
        })
    }

    async faceStatus({ request, response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const userId = request.auth.userId
        const userFace = await UserFace.query().where('userId', userId).where('id', params.id)
        if (userFace.length === 0) {
            return response.notFound({
                message: "User face not found"
            })
        }

        userFace[0].active = !userFace[0].active
        await userFace[0].save()

        return response.ok({
            message: "Face status updated"
        })
    }

    async faceDelete({ request, response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const userId = request.auth.userId
        const userFace = await UserFace.query().where('userId', userId).where('id', params.id).preload('storageData')
        if (userFace.length === 0) {
            return response.notFound({
                message: "User face not found"
            })
        }

        const imageManagement = new ImageManagement()
        try {
            await imageManagement.removeImage(userFace[0].storageData.publicId)
            await userFace[0].storageData.delete()
        } catch (error) {
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        await userFace[0].delete()

        return response.ok({
            message: "Face deleted"
        })
    }
}
