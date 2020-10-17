const Connection = require('./Connection')
const ejs = require('ejs')
const path = require('path')

// for sending email
const transporter = Connection.transporter

module.exports = {
    SendEmail: async function (data) {
        return new Promise((resolve,reject) => {
            var resp = {}
            if (transporter.isIdle()) {
                dataMail = {
                    clientName: data.clientName,
                    clientPhone: data.clientPhone,
                    clientAddr: data.clientAddr,
                }
                ejs.renderFile(path.join(__dirname, '../../files/example_email.ejs'), dataMail, function (err,html) {
                    if (err) {
                        resp.meta = {
                            code: 400,
                            message: 'Fail Render File ejs : '+err
                        }
                        reject(resp)
                    } else {
                        var options = {
                            from: data.emailFrom,
                            to: data.emailTo,
                            subject: data.emailSubject,
                            html: html
                        }
                        transporter.sendMail(options, function (err, info) {
                            if (err) {
                                resp.meta = {
                                    code: 500,
                                    message: 'Fail Send Mail : '+err
                                }
                                reject(resp)
                            } else {
                                resp.meta = {
                                    code: 200,
                                    message: 'Success Send Mail'
                                }
                                resp.info = info
                                resolve(resp)
                            }
                        })
                    }
                })
            } else {
                resp.meta = {
                    code: 400,
                    message: 'Transporter Not Idle'
                }
                reject(resp)
            }
        })
    }
}