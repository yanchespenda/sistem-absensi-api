import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Application from '@ioc:Adonis/Core/Application'
import Hash from '@ioc:Adonis/Core/Hash'

import ImageManagement from "App/Helpers/ImageManagement"

import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

import MdlUser from '../../Models/User'
// import MdlUserFace from '../../Models/UserFace'
import MdlStorage from '../../Models/Storage'
import { SidenavMenu, SidenavMenuChildren } from 'App/Interfaces/UserSidenav'

const defaultAvatar = 'https://res.cloudinary.com/dslncjjz1/image/upload/v1601800167/storage/absensi/default_avatar.png'

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

        return response.send({
            data: upload
        })
    }

    async uploadAvatarBase64({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                avatar: schema.string(),
            }),
            messages: {
                'avatar.required': 'Avatar required',
            }
        })

        if (!validated) {
            return response.badRequest({
                message: "Missing body"
            })
        }

        const moveResource = validated.avatar

        const user = await MdlUser.find(request.auth?.userId)
        if (!user) {
            return response.unsupportedMediaType({
                message: "User not found"
            })
        }

        const imageManagement = new ImageManagement()

        let upload
        try {
            upload = await imageManagement.uploadAvatar(moveResource, '', true)
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

        let url = defaultAvatar
        try {
            const filename = upload.publicId + '.' + upload.format
            url = await imageManagement.publicURL(filename, upload.version, {
                width: 36,
                height: 36,
                crop: "fit" 
            })
        } catch (error) {
            console.log('error:UsersController:uploadAvatarBase64:imageManagement:publicURL', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        return response.send({
            data: url
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

                menuChildren = {
                    url: '/faces',
                    title: 'Setting Faces',
                    icon: {
                        enable: true,
                        name: 'FaceIcon'
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

        // await this.sleep(2000)

        return response.ok(menuList)
    }

    async password({ request, response }: HttpContextContract) {
        const validated = await request.validate({
            schema: schema.create({
                passwordOld: schema.string(),
                passwordNew: schema.string(),
                passwordNewRepeat: schema.string(),
            }),
            messages: {
                'passwordOld.required': 'Old password required',
                'passwordNew.required': 'New password required',
                'passwordNewRepeat.required': 'Repeat password required',
            }
        })

        if (validated.passwordNew !== validated.passwordNewRepeat) {
            return response.unprocessableEntity({
                message: "Repeat password does not match"
            })
        }

        const currentPassword = validated.passwordOld
        const passwordNew = validated.passwordOld
        

        const userId = request.auth?.userId || 0

        const user = await MdlUser.find(userId)
        if (!user) {
            return response.notFound({
                message: "User not found"
            })
        }

        let match = false
        try {
            match = await Hash.verify(user.password, currentPassword);
        } catch (error) {
            console.log('err', error)
            return response.internalServerError({
                message: "Something went wrong"
            })
        }

        if(!match) {
            return response.unprocessableEntity({
                message: "Password invalid"
            })
        }

        user.password = passwordNew
        await user.save()

        return response.ok({
            message: "Password changed"
        })
    }

    async me({ request, response }: HttpContextContract) {
        if (!request.auth?.userId) {
            return response.forbidden({
                message: "Auth token required"
            })
        }

        const userId = request.auth.userId
        const user = await MdlUser.find(userId)
        if (!user) {
            return response.unprocessableEntity({
                message: "User not found"
            })
        }

        const imageManagement = new ImageManagement()

        let url = defaultAvatar
        if (user.avatar) {
            const getAvatarData = await MdlStorage.find(user.avatar)
            if (getAvatarData) {
                const parseAvatarData = JSON.parse(getAvatarData.raw)
                try {
                    const filename = getAvatarData.publicId + '.' + parseAvatarData.format
                    url = await imageManagement.publicURL(filename, parseAvatarData.version, {
                        width: 36,
                        height: 36,
                        crop: "fit" 
                    })
                } catch (error) {
                    console.log('error:UsersController:me:imageManagement:publicURL', error)
                    return response.internalServerError({
                        message: "Something went wrong"
                    })
                }
            }
        }

        let userMenu = [
            {
                url: '/account/avatar',
                title: 'Setting avatar',
                icon: {
                    enable: true,
                    name: 'FaceIcon'
                }
            },
            {
                url: '/account/setting',
                title: 'Setting account',
                icon: {
                    enable: true,
                    name: 'SettingsIcon'
                }
            }
        ]

        return response.ok({
            avatar: url,
            menu: userMenu
        })
    }

    async sleep(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        })
    }

}
