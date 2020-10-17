const path = require('path')
require('dotenv').config({ path:path.join(__dirname, '.env') })
const express = require('express')
const morgan = require('morgan')
const winston = require('./config/.winston')
const bodyParser = require('body-parser')
const router = require('./routes/Router')
const QueueMail = require('./library/QueueMail-bull/Index')

// create server
const app = express()
const server = require('http').createServer(app)

// log every request
var customCombined = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":total-time ms"'
app.use(morgan(customCombined, { stream: winston.stream }))

// parsing content-type urlencoded
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}))

// parsing content-type json
app.use(bodyParser.json({
    limit: '100mb'
}))

// Control Header
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
    res.header('Access-Control-Expose-Headers', 'Content-Length')
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range, x-api-key, x-forwarded-for')
    if (req.method === 'OPTIONS') {
        res.json(200)
    } else {
        return next()
    }
})

// set routes
router.routesConfig(app)

// queue mail
QueueMail.EventProcessMail()
QueueMail.EventResultMail()

// start server
server.listen(process.env.PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log(`Service Email Running On Port ${host} ${port} `)
})