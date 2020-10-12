import Application from '@ioc:Adonis/Core/Application'
import cloudinary from "cloudinary"
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'

export default class ImageManagement {

    /* constructor() {

    } */

    async uploadAttedance(face) {
        const filename = uuidv4() + '.jpg'

        let image
        try {
            const data = face.split(',')[1]
            const bufferImage = Buffer.from(data, 'base64')
            image = path.join(Application.tmpPath('uploads'), filename)
            await sharp(bufferImage).resize({width: 1000, height: 1000}).jpeg().toFile(image)
        } catch (error) {
            console.log('error:ImageManagement:uploadAttedance:sharp', error)
            throw 'Failed to convert image'
        }

        let response
        try {
            const publicId = 'storage/absensi/attedance/' + filename.replace('.jpg', '')
            response = await cloudinary.v2.uploader.upload(face, {resource_type: 'image', public_id: publicId, type: "private", access_mode: "authenticated"})
        } catch (error) {
            console.log('error:ImageManagement:uploadAttedance:cloudinary', error)
            throw 'Failed to upload attedance'
        }
        fs.unlinkSync(image)
        
        return response
    }

    async uploadFace(face) {
        const filename = uuidv4() + '.jpg'
        let image
        try {
            const data = face.split(',')[1]
            const bufferImage = Buffer.from(data, 'base64')
            image = path.join(Application.tmpPath('uploads'), filename)
            await sharp(bufferImage).resize({width: 1000, height: 1000}).jpeg().toFile(image)
        } catch (error) {
            console.log('error:ImageManagement:uploadFace:sharp', error)
            throw 'Failed to convert image'
        }

        let response
        try {
            const publicId = 'storage/absensi/face/' + filename.replace('.jpg', '')
            response = await cloudinary.v2.uploader.upload(image, {resource_type: 'image', public_id: publicId, type: "private", access_mode: "authenticated"})
        } catch (error) {
            console.log('error:ImageManagement:uploadFace:cloudinary', error)
            throw 'Failed to upload face'
        }
        fs.unlinkSync(image)
        
        return response
    }

    async uploadAvatar(avatar, filename: string = '') {
        if (filename === '') {
            filename = uuidv4() + '.webp'
        }
        let image
        try {
            image = path.join(Application.tmpPath('uploads'), filename)
            await sharp(avatar).resize({width: 1000}).webp().toFile(image)
        } catch (error) {
            console.log('error:ImageManagement:uploadAvatar:sharp', error)
            throw 'Failed to convert image'
        }

        let response
        try {
            const publicId = 'storage/absensi/avatar/' + filename.replace('.webp', '')
            response = await cloudinary.v2.uploader.upload(image, {resource_type: 'image', public_id: publicId})
        } catch (error) {
            console.log('error:ImageManagement:uploadAvatar:cloudinary', error)
            throw 'Failed to upload avatar'
        }
        fs.unlinkSync(image)
        
        return response
    }

    async removeImage(filename) {
        try {
            return await cloudinary.v2.api.delete_resources([filename])
        } catch (error) {
            console.log('error:ImageManagement:removeImage:cloudinary', error)
            throw 'Failed to delete'
        }
    }

    async privateURL(filename, version = 0, transformation = {}) {
        try {
            return cloudinary.v2.url(filename, {secure: true, sign_url: true, type: "private", version: version, transformation: transformation})
        } catch (error) {
            console.log('error:ImageManagement:privateURL:cloudinary', error)
        }
    }

    async publicURL(filename, version = 0, transformation = {}) {
        try {
            return cloudinary.v2.url(filename, { secure: true, version: version, transformation: transformation, sign_url: true })
        } catch (error) {
            console.log('error:ImageManagement:publicURL:cloudinary', error)
        }
    }
}
