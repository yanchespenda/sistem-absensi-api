import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'

import MdlUser from '../../../Models/User'

import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import { Workbook } from 'exceljs'
import { DateTime } from 'luxon'
import cloudinary from "cloudinary"
import path from 'path'
import fs from 'fs'

interface DashboardDataKaryawanAttedanceHistory {
    date: string | DateTime
    info: string | null
    duration: string
    wasIn: boolean
    wasOut: boolean
    dateIn: string
    dateOut: string
}

export default class StaffController {

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
