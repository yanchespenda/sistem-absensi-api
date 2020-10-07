import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AttedanceManagement from 'App/Helpers/AttedanceManagement'
import UserFace from 'App/Models/UserFace'

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

        try {
            await attedanceManagement.attedanceInUser(userId, 0)
        } catch (error) {
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

        if (!getCurrentStatus) {
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
            await attedanceManagement.attedanceOutUser(userId, 0)
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

        const userId = request.auth.userId

        // const attedanceManagement = new AttedanceManagement()



        
        const userFace = await UserFace.query().where('userId', userId).preload('storageData')
        if (userFace.length > 0) {
            
        }

        return response.ok({
            userFace: userFace
        })
    }

    async faceListAdd({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        // const userId = request.auth.userId

        
    }
}
