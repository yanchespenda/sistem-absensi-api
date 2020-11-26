import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import { schema } from '@ioc:Adonis/Core/Validator'

import { DateTime } from 'luxon'
import ImageManagement from 'App/Helpers/ImageManagement'
import axios from 'axios'
import { Workbook } from "exceljs"
import cloudinary from "cloudinary"
import path from 'path'
import fs from 'fs'

import UserFace from 'App/Models/UserFace'
import User from 'App/Models/User'
import MdlStorage from '../../../Models/Storage'

// const FACE_RECOG_API = 'https://api-face-absensi.project.arproject.web.id' 
const FACE_RECOG_API = 'https://faceapi-v2-4fs36buoaq-uc.a.run.app'
const MAX_FACE_DATA = 3

interface DashboardDataKaryawanAttedanceHistory {
    date: string | DateTime
    info: string | null
    duration: string
    wasIn: boolean
    wasOut: boolean
    dateIn: string
    dateOut: string
}

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

        // console.log('axios', axiosData.data)
        if (!axiosData.data.result) {
            try {
                await imageManagement.removeImage(upload.public_id)
            } catch (error) {
                console.log('error', error)
            }
            return response.unprocessableEntity({
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

    async historyList({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        let getParamMin = request.input('start')
        let getParamMax = request.input('end')

        if (!getParamMin) {
            getParamMin = DateTime.local().minus({days: 30})
        } else {
            getParamMin = DateTime.fromISO(getParamMin)
        }
        if (!getParamMax) {
            getParamMax = DateTime.local()
        } else {
            getParamMax = DateTime.fromISO(getParamMax)
        }

        // console.log('getParamMin', getParamMin)
        // console.log('getParamMax', getParamMax)

        const userId = request.auth?.userId || 0

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const getAttedances = await attedanceManagement.attedanceListByDate(userId, getParamMin, getParamMax)
        let attedanceList: DashboardDataKaryawanAttedanceHistory[] = []
        if (getAttedances.length > 0) {
            attedanceList = await attedanceManagement.attedanceListTable(getAttedances)
        }


        return response.ok(attedanceList)
    }

    async historyGenerate({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        let getParamMin = request.input('start')
        let getParamMax = request.input('end')

        if (!getParamMin) {
            getParamMin = DateTime.local().minus({days: 30})
        } else {
            getParamMin = DateTime.fromISO(getParamMin)
        }
        if (!getParamMax) {
            getParamMax = DateTime.local()
        } else {
            getParamMax = DateTime.fromISO(getParamMax)
        }

        const userId = request.auth?.userId || 0

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const getAttedances = await attedanceManagement.attedanceListByDate(userId, getParamMin, getParamMax)
        let attedanceList: DashboardDataKaryawanAttedanceHistory[] = []
        if (getAttedances.length > 0) {
            attedanceList = await attedanceManagement.attedanceListTable(getAttedances)
        }

        const workbook = new Workbook()
        workbook.creator = 'Administrator'
        workbook.lastModifiedBy = 'Administrator'
        workbook.created = DateTime.local().toJSDate()
        workbook.modified = DateTime.local().toJSDate()
        workbook.lastPrinted = DateTime.local().toJSDate()

        const worksheet = workbook.addWorksheet('Attedance')

        worksheet.columns = [
            { 
                header: 'Date', 
                key: 'date', 
                outlineLevel: 1,
                width: 20,
            },
            { 
                header: 'Time In', 
                key: 'timeIn', 
                outlineLevel: 1,
                width: 15,
            },
            { 
                header: 'Time Out', 
                key: 'timeOut', 
                outlineLevel: 1,
                width: 15,
            },
            { 
                header: 'Hour Work', 
                key: 'hourWork', 
                outlineLevel: 1,
                width: 30,
            },
            { 
                header: 'Info', 
                key: 'info', 
                outlineLevel: 1,
                width: 30,
            },
        ]

        attedanceList.forEach(item => {
            worksheet.addRow({
                date: item.date, 
                timeIn: DateTime.fromISO(item.dateIn).toFormat('H:mm:ss'), 
                timeOut: DateTime.fromISO(item.dateOut).toFormat('H:mm:ss'),
                hourWork: item.duration,
                info: item.info === null ? '-' : item.info
            })
        })

        worksheet.eachRow({ includeEmpty: false }, (_row, rowNumber) => {
            const insideColumns = ['A', 'B', 'C', 'D', 'E']
            insideColumns.forEach((v) => {
                worksheet.getCell(`${v}${rowNumber}`).border = {
                    top: {style: 'thin'},
                    bottom: {style: 'thin'},
                    left: {style: 'thin'},
                    right: {style: 'thin'}
                }
            })
        })

        const user = await User.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "Current user not found"
            })
        }

        const exelName = `report-of-${user.username}.xlsx`
        const pathExel = path.join(Application.tmpPath('uploads'), exelName)
        await workbook.xlsx.writeFile(pathExel)

        let responseUpload: any
        try {
            const publicId = 'storage/absensi/report/' + exelName
            responseUpload = await cloudinary.v2.uploader.upload(pathExel, {resource_type: 'raw', public_id: publicId, type: "private", access_mode: "authenticated"})
        } catch (error) {
            console.log('error:KaryawansController:historyGenerate:cloudinary', error)
            return response.unprocessableEntity({
                message: "Something went wrong"
            })
        }
        fs.unlinkSync(pathExel)

        if (!responseUpload?.secure_url) {
            return response.unprocessableEntity({
                message: "Something went wrong"
            })
        }

        return response.ok({
            message: "OK",
            url: responseUpload.secure_url
        })

    }
}
