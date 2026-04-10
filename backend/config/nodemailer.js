import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP ERROR:", error.message)
    } else {
        console.log("SMTP server ready")
    }
})

export default transporter;