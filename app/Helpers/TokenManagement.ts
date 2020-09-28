import fs from 'fs'
import jwt from 'jsonwebtoken'

import JwtConfig from "../../config/jwt"

export default class TokenManagement {
    private tokenAlgoritm: any
    private keyPrivate
    private keyPublic
    private keySecret: string
    private isRSA: boolean
    private tokenValid: string
    private jwtOptions: jwt.SignOptions = {}

    constructor() {
        this.tokenAlgoritm = JwtConfig.tokenAlgorithm
        
        if (this.tokenAlgoritm.search('RS') !== -1) {
            this.isRSA = true
        } else {
            this.isRSA = false
            this.keySecret = JwtConfig.secretKey
        }

        this.tokenValid = JwtConfig.tokenValid

        this.jwtOptions = {
            algorithm: this.tokenAlgoritm,
            expiresIn: this.tokenValid
        }
    }

    hash(payload: object): string {
        try {
            let token: string
            if (this.isRSA) {
                this.keyPrivate = fs.readFileSync(JwtConfig.privateKey)
                token = jwt.sign(payload, this.keyPrivate, this.jwtOptions)
            } else {
                token = jwt.sign(payload, this.keySecret, this.jwtOptions)
            }
            return token
        } catch (error) {
            throw 'Signin token error'
        }
    }

    verify(token: string): object | string {
        try {
            let decoded: any
            if (this.isRSA) {
                this.keyPublic = fs.readFileSync(JwtConfig.publicKey)
                decoded = jwt.verify(token, this.keyPublic, { algorithms: [this.tokenAlgoritm] })
            } else {
                decoded = jwt.verify(token, this.keySecret, { algorithms: [this.tokenAlgoritm] })
            }
            
            return decoded
        } catch(error) {
            throw 'Verify token error'
        }
    }
}
