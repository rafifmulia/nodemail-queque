const Connection = require('./Connection')
const ejs = require('ejs')
const path = require('path')

const transporter = Connection.transporter

module.exports = {
    SendEmail: async function (data) {
        return new Promise((resolve,reject) => {
            if (transporter.isIdle()) {
                dataMail = {
                    clientName: data.clientName,
                    clientPhone: data.clientPhone,
                    clientAddr: data.clientAddr,
                }
                ejs.renderFile(path.join(__dirname, '../../files/example_email.ejs'), dataMail, function (err,html) {
                    if (err) {
                        reject(err)
                    } else {
                        var options = {
                            from: data.emailFrom,
                            to: data.emailTo,
                            subject: data.emailSubject,
                            html: html
                        }
                        transporter.sendMail(options, function (err, info) {
                            if (err) {
                                reject(err)
                            } else {
                                resolve(info)
                            }
                        })
                    }
                })
            } else {
                reject('Transporter Not Idle')
            }
        })
    }
}