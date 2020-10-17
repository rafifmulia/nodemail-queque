const Bull = require('bull')
const { setQueues } = require('bull-board')
const Models = require('./Models')

// create object queue named: 'QueueMail-bull'
const QueueMail = new Bull('QueueMail-bull', {
    redis: { // connect to redis
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },
    limiter: { // max jobs per ms
        max: 1000,
        duration: 5000
    }
})

setQueues([QueueMail])

/**
 * STATE
 * waiting: after queue.add or retry
 * active: after waiting
 * progress: after active executed and before active finished
 * drained: trigger when queue waiting is 0
 * completed: after active(if success)
 * failed: after active(if fail)
 * removed: trigger from(waiting,active,completed,failed)
 * stalled: for debugging
 */

async function ast () {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(false)
        }, 5000)
    })
}

module.exports = {
    // producers
    SendMail: async function (data) {
        var resp = {}
        try {
            var job = await QueueMail.add(data, {
                opts: {
                    attempts: 3
                }
            })
            
            resp.meta = {
                code: 200,
                message: 'Succes Add To Queue'
            }
            resp.job = job

            return resp
        } catch (err) {
            resp.meta = {
                code: 500,
                message: 'Error Add To Queue : '+err
            }

            return resp
        }
    },
    // consumers
    EventProcessMail: async function () {
        QueueMail.process(async (job) => {
            var resp = {}
            try {
                var recursive = true
                var emailInfo = {}

                do {
                    // recursive = await ast()
                    emailInfo = await Models.SendEmail(job.data)
                    if (emailInfo.meta.message != 'Transporter Not Idle') {
                        recursive = false
                    }
                } while (recursive)
                job.progress(100)

                resp.meta = {
                    code: 200,
                    message: 'Success Process Queue'
                }
                resp.emailInfo = emailInfo

                return resp
            } catch (err) {
                resp.meta = {
                    code: 500,
                    message: 'Error Process Queue : '+JSON.stringify(err)
                }

                return resp
            }
        })
    },
    // listeners
    EventResultMail: async function () {
        QueueMail.on('completed', async (job, result) => {
            var resp = {}
            job.getState().then(function (status) {
                console.log('COMPLETED : ', status)
            })
            try {
                resp.meta = {
                    code: 200,
                    message: 'Success Get Complete Queue'
                }
                resp.job = job
                resp.result = result

                job.remove()
            } catch (err) {
                resp.meta = {
                    code: 500,
                    message: 'Error Get Complete Queue : '+err
                }

                job.remove()
            }
        })

        QueueMail.on('failed', async (job, err) => {
            var resp = {}
            job.getState().then(function (status) {
                console.log('FAILED : ', status)
            })
            try {
                resp.meta = {
                    code: 200,
                    message: 'Success Get Failed Queue'
                }
                resp.job = job
                resp.err = err

                job.retry()
                return JSON.stringify(resp)
            } catch (err) {
                resp.meta = {
                    code: 500,
                    message: 'Error Get Failed Queue : '+err
                }

                job.retry()
                return JSON.stringify(resp)
            }
        })

        QueueMail.on('error', async (err) => {
            console.log('ERROR : ', err)
        })

        QueueMail.on('drained', async () => {
            console.log('DRAINED : ')
        })

        QueueMail.on('waiting', async (jobId) => {
            console.log('WAITING : ', jobId)
        })

        QueueMail.on('active', async (job, jobPromise) => {
            job.getState().then(function (status) {
                console.log('ACTIVE : ', status, ':', job.id) // stuck mean null
            })
        })

        QueueMail.on('progress', async (job, progress) => {
            job.getState().then(function (status) {
                console.log('PROGRESS : ', status, ' : ', progress)
            })
        })

        QueueMail.on('removed', async (job) => {
            job.getState().then(function (status) {
                console.log('REMOVED : ', status) // stuck mean null
            })
        })

        QueueMail.on('stalled', function(job){
            job.getState().then(function (status) {
                console.log('STALLED : ', status)
            })  
        })

        QueueMail.on('cleaned', function(jobs, type){
            console.log('CLEANED : ', type)
        })
    }
}