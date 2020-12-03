import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'

import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import cloudinary from "cloudinary"

import MdlUser from '../../../Models/User'
// import MdlUserFace from '../../../Models/UserFace'
import MdlStorage from '../../../Models/Storage'
import ImageManagement from 'App/Helpers/ImageManagement'
import { DateTime } from 'luxon'
import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import { Workbook } from 'exceljs'

const defaultAvatar = 'https://res.cloudinary.com/dslncjjz1/image/upload/v1601800167/storage/absensi/default_avatar.png'


interface DashboardDataKaryawanAttedanceHistory {
    date: string | DateTime
    info: string | null
    duration: string
    wasIn: boolean
    wasOut: boolean
    dateIn: string
    dateOut: string
}

export default class AdminsController {

    /**
     * Show data table users
     * 
     * @param number page
     * @param number perPage
     */
    async users({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                page: schema.number(),
                perPage: schema.number(),
            }),
            messages: {
                'page.required': 'Page required',
                'perPage.required': 'PerPage required',
            }
        })

        if (validated.perPage !== 5 && validated.perPage !== 10 && validated.perPage !== 25) {
            return response.badRequest({
                message: "perPage only accept 5, 10, 25"
            })
        }

        const { page, perPage } = validated
        const getOffset = page > 0 ? (page) * perPage : 0

        const userCount = await MdlUser.query().count('id as total')

        let returnUser: any = []
        let currentConfig = {
            totalItems: userCount[0].total,
            currentPage: page,
            perPage: perPage
        }

        if (userCount[0].total > 0) {
            const user = await MdlUser.query().limit(perPage).offset(getOffset).orderBy('id', 'desc')

            let currentNumber = getOffset + 1
            user.forEach(item => {
                let user = {
                    no: currentNumber,
                    id: item.id,
                    username: item.username,
                    lastAttendAt: item.lastAttendedAt,
                    lastLoggedAt: item.lastLoggedAt
                }
                if (request.auth?.userId) {
                    if (item.id === request.auth.userId) {
                        user.username = `${item.username} [You]`
                    }
                }
                returnUser.push(user)
                currentNumber++
            })
        }

        return response.ok({
            config: currentConfig,
            items: returnUser,
        })
    }

    /**
     * Dialog edit user
     * 
     * @param number id
     */
    async userEdit({ response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        const userId = params.id

        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "User not found"
            })
        }

        let avatar: any = defaultAvatar
        if (user.avatar !== null) {
            const storage = await MdlStorage.find(user.avatar)
            if (storage) {
                const storageParse = JSON.parse(storage.raw)
                if (storageParse) {
                    const imageManagement = new ImageManagement()

                    const filename = storage.publicId + '.' + storageParse.format
                    try {
                        avatar = await imageManagement.publicURL(filename, storageParse.version, {
                            width: 144,
                            height: 144,
                            crop: "fill"
                        })
                    } catch (error) {
                        
                    }
                }
            }
        }

        return response.ok({
            username: user.username,
            lastAttendAt: user.lastAttendedAt,
            createdAt: user.createdAt,
            avatar: avatar,
        })
    }

    /**
     * User edit save
     */
    async userEditSave({ request, response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        const validated = await request.validate({
            schema: schema.create({
                username: schema.string(),
                password: schema.string.optional({}, [
                    rules.minLength(6),
                    rules.maxLength(25)
                ]),
            }),
            messages: {
                'username.required': 'Username required',
                'password.minLength': 'Password to short',
                'password.maxLength': 'Password to long',
            }
        })

        const { username, password } = validated
        const userId = params.id
        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "User not found"
            })
        }

        console.log('password', password)

        user.username = username
        // user.password = password
        await user.save()

        return response.ok({
            message: "User saved"
        })
    }

    /**
     * User delete
     */
    async userDelete({ request, response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        const userId = params.id

        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "User not found"
            })
        }

        let enableDelete = true
        if (request.auth?.userId == userId) {
            enableDelete = false
        }

        if (enableDelete) {
            // await user.delete()
        } else {
            return response.ok({
                message: "Unable to self delete"
            })
        }

        return response.ok({
            message: "User deleted"
        })
    }

    /**
     * Dialog edit avatar
     */
    async userEditAvatar({ request, response, params }: HttpContextContract) {
        if (!params.id) {
            return response.badRequest({
                message: "Param id required"
            })
        }

        const validated = await request.validate({
            schema: schema.create({
                avatar: schema.file({
                    size: '2mb',
                    extnames: ['jpg', 'png', 'jpeg'],
                }),
            }),
            messages: {
                'avatar.required': 'Avatar required',
                'avatar.file.size': 'Avatar to large',
                'avatar.file.extnames': 'Avatar extension must images',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing body"
            })
        }

        await validated.avatar.move(Application.tmpPath('uploads'))
        const resourceName = validated.avatar.fileName || uuidv4()
        const moveResource = path.join(Application.tmpPath('uploads'), resourceName)

        const user = await MdlUser.find(params.id)
        if (!user) {
            return response.unsupportedMediaType({
                message: "User not found"
            })
        }

        const imageManagement = new ImageManagement()

        let upload
        try {
            upload = await imageManagement.uploadAvatar(moveResource)
        } catch (error) {
            console.log('e1a', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        if (user.avatar) {
            const getLastPublicId = await MdlStorage.find(user.avatar)
            if (getLastPublicId) {
                try {
                    await imageManagement.removeImage(getLastPublicId.publicId)
                    await getLastPublicId.delete()
                } catch (error) {
                    console.log('e1b', error)
                    return response.internalServerError({
                        message: "Something went wrong"
                    })
                }
            }
        }

        const getStorage = await MdlStorage.create({
            publicId: upload.public_id,
            raw: upload
        })

        user.avatar = getStorage.id
        await user.save()

        fs.unlinkSync(moveResource)

        let avatar: any = defaultAvatar
        const filename = upload.public_id + '.' + upload.format
        try {
            avatar = await imageManagement.publicURL(filename, upload.version, {
                width: 144,
                height: 144,
                crop: "fill"
            })
        } catch (error) {
            console.log('error', error)
        }

        return response.ok({
            username: user.username,
            lastAttendAt: user.lastAttendedAt,
            createdAt: user.createdAt,
            avatar: avatar,
        })
    }

    /**
     * Show data table attedance
     * 
     */
    async attedance({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const attedanceQuery = await attedanceManagement.staffFindAttedanceToday()
        const attedanceList = await attedanceManagement.staffAttedanceListTable(attedanceQuery)

        return response.ok(attedanceList)
    }

    async historyList({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        let getParamMin = request.input('start')
        let getParamMax = request.input('end')

        const userId = request.input('id') || 0
        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "User not found"
            })
        }

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

        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()

        const getAttedances = await attedanceManagement.attedanceListByDate(userId, getParamMin, getParamMax)
        let attedanceList: DashboardDataKaryawanAttedanceHistory[] = []
        if (getAttedances.length > 0) {
            attedanceList = await attedanceManagement.attedanceListTable(getAttedances)
        }


        return response.ok({
            user: user.username,
            attedanceList
        })
    }

    async historyGenerate({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        let getParamMin = request.input('start')
        let getParamMax = request.input('end')

        const userId = request.input('id') || 0
        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "Current user not found"
            })
        }

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

        const exelName = `report-of-${user.username}.xlsx`
        const pathExel = path.join(Application.tmpPath('uploads'), exelName)
        await workbook.xlsx.writeFile(pathExel)

        let responseUpload: any
        try {
            const publicId = 'storage/absensi/report/staff/' + exelName
            responseUpload = await cloudinary.v2.uploader.upload(pathExel, {resource_type: 'raw', public_id: publicId, type: "private", access_mode: "authenticated"})
        } catch (error) {
            console.log('error:StaffController:historyGenerate:cloudinary', error)
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

    /**
     * permission check
     */
    async permission({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        } 

        if (request.roles?.length === 0) {
            return response.forbidden({
                message: "You dont have any role"
            })
        }

        return response.ok({
            message: "OK"
        })
    }
}
