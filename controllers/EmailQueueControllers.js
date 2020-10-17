const QueueMail = require('../library/QueueMail-bull/Index')

module.exports = {
    Queue: async function (req, res) {
        try {
            var apiRes = {}

            var data = {
                clientName: req.body.client.name,
                clientPhone: req.body.client.phone,
                clientAddr: req.body.client.address,
                emailFrom: req.body.email.from,
                emailTo: req.body.email.to,
                emailSubject: req.body.email.subject
            }

            var infoQueue = await QueueMail.SendMail(data)
            if (infoQueue.meta.code == 200) {
                apiRes.meta = {
                    code: '200_000',
                    message: 'Success Queued Email'
                }
                apiRes.info = infoQueue
                return res.status(200).json(apiRes)
            } else {
                apiRes.meta = {
                    code: '200_202',
                    message: 'Fail Queued Email : '+infoQueue.meta.message
                }
                apiRes.info = infoQueue
            }
            
            return res.status(200).json(apiRes)
        } catch (err) {
            var apiRes = {}
            apiRes.meta = {
                code: '400_000',
                message: 'Error Queued Email : '+err
            }
            return res.status(400).json(apiRes)
        }
    }
}