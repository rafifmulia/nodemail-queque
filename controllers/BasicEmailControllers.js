const BasicEmailModels = require('../library/BasicEmail-nodemailer/Index')

module.exports = {
    Send: async function (req,res) {
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

            BasicEmailModels.SendEmail(data)

            apiRes.meta = {
                code: '200_000',
                message: 'Sukses Kirim Email'
            }
            // apiRes.data = data
            return res.status(200).json(apiRes)
        } catch (err) {
            var apiRes = {}
            apiRes.meta = {
                code: '400_000',
                message: 'Error Kirim Email : '+err
            }
            return res.status(400).json(apiRes)
        }
    }
}