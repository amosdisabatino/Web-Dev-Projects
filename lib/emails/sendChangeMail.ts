import 'server-only';
import { mailTransport } from '../mail';

export async function  sendChangeMail(recipient: string, verificationUrl: string,) {
    
    const sender = process.env.MAIL_FROM;
    if (!sender){
        throw new Error("Missing Mail Sender.");
    }

    const safeUrl = verificationUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

    await mailTransport.sendMail({
        from: sender,
        to: recipient,
        subject: "Confirm Your New Email",
        text: [
            "Confirm your new email using this link:",
            verificationUrl,
            '',
            "This link expires in one hour",
            "if you did not request this registration, ignore this email.",
        ].join('\n'),
        html: `
            <h1>Confirm your new email</h1>
            <p>Thank you</p>
            <p>
                <a href="${safeUrl}">Confirm Email</a>
            </p>
            <p>This Link expires in one hour</p>
            <p>
                If you did not request this change, ignore this email.
            </p>
        `,
    })

}
