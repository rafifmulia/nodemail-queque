const path = require('path')
require('dotenv').config({ path:path.join(__dirname, '.env') })
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.EMAILSMTP,
    port: process.env.EMAILPORT,
    auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASS
    },
    pool: true,
    connectionTimeout: 5000,
    greetingTimeout: 2000,
    maxConnections: 20,
    maxMessages: 500,
    secure: false
})

transporter.verify(function (err,success) {
    if (err) {
        console.error(err)
        transporter.close()
        return
    }
})

module.exports = {
    transporter: transporter
}