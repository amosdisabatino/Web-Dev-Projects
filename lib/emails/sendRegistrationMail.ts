import 'server-only';
import { mailTransport } from '../mail';

export async function  sendRegistrationMail(recipient: string, verificationUrl: string,) {
    
    const sender = process.env.MAIL_FROM;
    if (!sender){
        throw new Error("Missing Mail Sender.");
    }

    const safeUrl = verificationUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

    await mailTransport.sendMail({
        from: sender,
        to: recipient,
        subject: "Confirm Your Registration",
        text: [
            "Thank You For Registering",
            "",
            "Confirm Your Email Using This Link:",
            verificationUrl,
            '',
            "This Link Expires In One Hour",
            "If You Did Not Request This Registration, Ignore This Email.",
        ].join('\n'),
        html: `
            <h1>Confirm You Registration</h1>
            <p>Thank You For Registering</p>
            <p>
                <a href="${safeUrl}">Confirm Email</a>
            </p>
            <p>This Link Expires In One Hour</p>
            <p>
                If You Did Not Request This Registration, Ignore This Email.
            </p>
        `,
    })

}
