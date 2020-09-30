import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'

import ImageManagement from "App/Helpers/ImageManagement"

import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

import MdlUser from '../../Models/User'
import MdlUserFace from '../../Models/UserFace'
import { SidenavMenu, SidenavMenuChildren } from 'App/Interfaces/UserSidenav'

const MAX_FACE_DATA = 10

export default class UsersController {

    async uploadAvatar({ request, response }: HttpContextContract) {
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

        const user = await MdlUser.find(request.auth?.userId)
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
            try {
                await imageManagement.removeImage(user.avatar)
            } catch (error) {
                console.log('e1b', error)
                return response.internalServerError({
                    message: "Something went wrong"
                })
            }
        }

        user.avatar = upload.public_id
        await user.save()

        fs.unlinkSync(moveResource)

        return response.send({
            data: upload
        })
    }

    async uploadFace({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                face: schema.file({
                    size: '2mb',
                    extnames: ['jpg', 'png', 'jpeg'],
                }),
            }),
            messages: {
                'face.required': 'Face required',
                'face.file.size': 'Face to large',
                'face.file.extnames': 'Face extension must images',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing body"
            })
        }

        await validated.face.move(Application.tmpPath('uploads'))
        const resourceName = validated.face.fileName || uuidv4()
        const moveResource = path.join(Application.tmpPath('uploads'), resourceName)

        const getUserId = request.auth?.userId || 0        
        const getUserFace = await MdlUserFace.query().where('userId', getUserId).count('id as total')
        if (getUserFace[0].total >= MAX_FACE_DATA) {
            return response.unprocessableEntity({
                message: "Face data was attemp max"
            })
        }

        const imageManagement = new ImageManagement()

        let upload
        try {
            upload = await imageManagement.uploadFace(moveResource)
        } catch (error) {
            console.log('e1a', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        const userFace = new MdlUserFace()
        userFace.userId = getUserId
        userFace.storageId = upload.public_id
        await userFace.save()

        fs.unlinkSync(moveResource)

        return response.send({
            url: imageManagement.publicURL(upload.public_id),
            data: upload,
        })
    }

    async faceUrl({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                faceId: schema.string(),
            }),
            messages: {
                'faceId.required': 'Face required',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing body"
            })
        }

        const imageManagement = new ImageManagement()
        let url
        try {
            url = await imageManagement.publicURL(validated.faceId)
        } catch (error) {
            console.log('error:UsersController:faceUrl:imageManagement:publicURL', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        return response.send({
            url: url,
            faceId: validated.faceId
        })
    }


    async sidenav({ request, response }: HttpContextContract) {
        if (request.roles?.length === 0) {
            return response.forbidden({
                message: "You dont have any role"
            })
        }

        let menuList: SidenavMenu[] = []

        let menu: SidenavMenu = {
            url: '/',
            title: 'Dashboard',
            icon: {
                enable: true,
                name: 'DashboardIcon'
            }
        }
        let menuChildren: SidenavMenuChildren
        menuList.push(menu)

        let menuListAdmin: SidenavMenuChildren[] = []
        let menuListStaff: SidenavMenuChildren[] = []
        let menuListKaryawan: SidenavMenuChildren[] = []

        request.roles?.forEach(role => {

            if (role.slug === 'admin') {
                menuChildren = {
                    url: '/admin/users',
                    title: 'Users',
                    icon: {
                        enable: true,
                        name: 'AccountBoxIcon'
                    }
                }
                menuListAdmin.push(menuChildren)

                menuChildren = {
                    url: '/admin/attendance',
                    title: 'Atendances',
                    icon: {
                        enable: true,
                        name: 'PeopleIcon'
                    }
                }
                menuListAdmin.push(menuChildren)

            }

            if (role.slug === 'staff') {
                menuChildren = {
                    url: '/staff/attendance',
                    title: 'Atendances',
                    icon: {
                        enable: true,
                        name: 'PeopleIcon'
                    }
                }
                menuListStaff.push(menuChildren)

            }

            if (role.slug === 'karyawan') {
                menuChildren = {
                    url: '/attendance',
                    title: 'Atendances',
                    icon: {
                        enable: true,
                        name: 'PeopleIcon'
                    }
                }
                menuListKaryawan.push(menuChildren)

            }

        })

        if (menuListAdmin.length > 0) {
            menu = {
                url: '/',
                title: 'Administrator',
                children: menuListAdmin
            }
            menuList.push(menu)
        }
        if (menuListStaff.length > 0) {
            menu = {
                url: '/',
                title: 'Staff Menu',
                children: menuListStaff
            }
            menuList.push(menu)
        }
        if (menuListKaryawan.length > 0) {
            menu = {
                url: '/',
                title: 'Karyawan Menu',
                children: menuListKaryawan
            }
            menuList.push(menu)
        }

        // console.log('request.auth', request.auth)
        // console.log('request.roles', request.roles)

        return response.ok(menuList)
    }

}
