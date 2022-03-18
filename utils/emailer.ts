import nodemailer from 'nodemailer';
import { cLog } from './logger';
import uploading from './uploadFile';
// host: "smtp.office365.com",
// port: 587,
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODE_MAILER_EMAIL_ADDRESS,
        pass: process.env.NODE_MAILER_EMAIL_PASSWORD
    }
});

export function passwordReset(emails: string, data: any) { // function to send the reset password link to the user

    // if (process.env.MODE === 'DEV') {
    //     emails = process.env.BCC_EMAIL
    // }
    const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL_ADDRESS,
        to: emails,
        bcc: process.env.BCC_EMAIL,
        subject: "Confirm Password Reset.",
        text: `LINK: ${process.env.DOMAIN_URL}?id=${data.id}&token=${data.stateToken}&verify=0`
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.log(error);
        } else {
            cLog('Email sent: ', info.response);
        }
    });

}
export function verifyEmail(emails: string, data: any) { // sends the verify account email to a user

    // if (process.env.MODE === 'DEV') {
    //     emails = process.env.BCC_EMAIL
    // }
    cLog("verify email", "verify email sent")
    const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL_ADDRESS,
        to: emails,
        bcc: process.env.BCC_EMAIL,
        subject: "Print On Demand Verification Email",
        text: `LINK: ${process.env.DOMAIN_URL}?id=${data.id}&token=${data.stateToken}&verify=1`
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.log(error);
        } else {
            cLog('Email sent: ', info.response);
        }
    });

}
export function logEmail(data: any) { // sends logs to all bbc members

    const mailOptions = {
        from: process.env.NODE_MAILER_EMAIL_ADDRESS,
        to: process.env.BCC_EMAIL,
        subject: "Current Logger",
        text: data
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
            console.log(error);
        } else {
            cLog('Email sent: ', info.response);
        }
    });

}

