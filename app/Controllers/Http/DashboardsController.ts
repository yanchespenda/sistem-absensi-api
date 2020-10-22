import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import User from 'App/Models/User'
import { DateTime } from 'luxon'

interface DashboardDataKaryawanAttedanceHistory {
    date: string | DateTime
    info: string | null
    duration: string
    wasIn: boolean
    wasOut: boolean
    dateIn: string
    dateOut: string
}

interface DashboardDataKaryawan {
    attedance: boolean
    attedanceToday: number
    attedanceHistory: DashboardDataKaryawanAttedanceHistory[]
}

interface DashboardReturn {
    type: number
    data: DashboardDataKaryawan | null
    greeting: string | null
}

export default class DashboardsController {

    async index({ request, response }: HttpContextContract) {
        if (request.roles?.length === 0) {
            return response.forbidden({
                message: "You dont have any role"
            })
        }

        let $dataReturn: DashboardReturn = {
            type: 0,
            data: null,
            greeting: null
        }

        const userId = request.auth?.userId || 0

        const user = await User.find(userId)
        if (user) {
            const getNow = DateTime.local()
            const getUsername = user.username
            let getGreeting = 'good night'
            if (getNow.hour >= 0 && getNow.hour < 12) {
                getGreeting = 'good morning'
            } else if (getNow.hour >= 12 && getNow.hour < 18) {
                getGreeting = 'good afternoon'
            } else if (getNow.hour >= 18 && getNow.hour < 20) {
                getGreeting = 'good evening'
            }

            $dataReturn.greeting = `Hello, ${getGreeting} ${getUsername}`
        }
        
        let roleType = 0
        let isBreak = false
        request.roles?.forEach(role => {
            if (!isBreak) {
                if (role.slug === 'admin') {
                    roleType = 1
                    isBreak = true
                } else if (role.slug === 'staff') {
                    roleType = 2
                    isBreak = true
                } else if (role.slug === 'karyawan') {
                    roleType = 3
                    isBreak = true
                }
            }
        })

        $dataReturn.type = roleType
        if (roleType === 1) {
            
        } else if (roleType === 2) {
            
        } else if (roleType === 3) {
            
            $dataReturn.data = await this.indexGerDataKaryawan(userId)
        }

        return response.ok($dataReturn)
    }

    async indexGerDataKaryawan(userId: number = 0) {
        const attedanceManagement = new AttedanceManagement()
        await attedanceManagement.getAttadanceConfig()
        
        const userStatus = await attedanceManagement.checkUserToday(userId)
        const getAttedances = await attedanceManagement.attedanceList(userId)
        let attedanceList: DashboardDataKaryawanAttedanceHistory[] = []
        if (getAttedances.length > 0) {
            attedanceList = await attedanceManagement.attedanceListTable(getAttedances)
        }

        const dashboardDataKaryawan: DashboardDataKaryawan = {
            attedance: userStatus.found,
            attedanceHistory: attedanceList,
            attedanceToday: userStatus.wasOut ? 2 : userStatus.wasIn ? 1 : 0
        }
        
        return dashboardDataKaryawan
    }
}
