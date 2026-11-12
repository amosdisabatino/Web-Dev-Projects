import 'server-only';
import nodemailer from 'nodemailer';

export const mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
})
