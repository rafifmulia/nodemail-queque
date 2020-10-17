const API_URL = process.env.API_URL

const { UI } = require('bull-board')
const BasicEmailControllers = require('../controllers/BasicEmailControllers')
const EmailQueueControllers = require('../controllers/EmailQueueControllers')

exports.routesConfig = function (app) {
    // basic send mail nodemailer
    app.post('/'+API_URL+'/basic/send', BasicEmailControllers.Send)
    // basic send mail nodemailer

    // queue mail with bull
    app.post('/'+API_URL+'/queue/send', EmailQueueControllers.Queue)
    // queue mail with bull

    // admin bull-board
    app.use('/bull-board', UI)
    // admin bull-board
}