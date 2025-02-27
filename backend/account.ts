import express from 'express'
import path from 'path'
import jwt from 'jsonwebtoken'
import getSecret from './util/secret'
import { changePasswordToken } from '../scheme/api/auth'
import createURL from '../scheme/url'

declare const DEV_MODE: boolean
const authRouter = express.Router()

authRouter.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'template', 'auth.html'))
})

authRouter.get('/changesecret/:token', (req, res) => {
    try {
        let token = jwt.verify(
            req.params.token,
            getSecret('token')
        ) as changePasswordToken
        if (token.expire < Date.now()) throw new Error()
        res.sendFile(path.join(__dirname, '..', 'template', 'auth.html'))
    } catch (e) {
        res.sendFile(
            path.join(__dirname, '..', 'template', 'changesecretfail.html')
        )
    }
})

authRouter.get('/challenge', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'template', 'auth.html'))
})

authRouter.get('/signout', (req, res) => {
    res.cookie('auth', '', {
        maxAge: -1,
        httpOnly: true,
        ...(!DEV_MODE && { domain: '.iasa.kr' }),
    })
    res.redirect('/')
})

authRouter.use('*', (req, res) => {
    res.redirect(createURL(''))
})

export default authRouter
