const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const { text } = require('body-parser')

dotenv.config({ path: '.env' })



async function sendMail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port : 587 , 
            secure : false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            }
        })
        console.log(transporter.auth?.user)
        const mailOptions = {
            from: 'mohamedadhiltp1944@gmail.com',
            to: email,
            subject: `Order confirmation`,
            text: `Greeting from Graza , your otp for placing the order is ${otp}`
        }
        const info = await transporter.sendMail(mailOptions)
        console.log(info.response)
    } catch (error) {
        console.log('node mailer ', error.message)
    }
}

module.exports  = sendMail