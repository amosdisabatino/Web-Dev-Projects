'use server'
import { checkPassword } from '@/lib/validation';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import { sendChangeMail } from '@/lib/emails/sendChangeMail';
import { sendRegistrationMail } from '@/lib/emails/sendRegistrationMail';
import { jwtVerify, SignJWT } from 'jose';

function getIsoDate(rawDate: string) {
    if (rawDate) {
        const isoDate = new Date(rawDate).toISOString();
        return isoDate;
    } else {
        return false;
    }
}

export async function changeMail(formData: FormData) {
    const user = await getUserSession();
    if (!user) {
        return { success: false, message: "User Not Authorized.",};
    }
    const newMail = formData.get('new_email') as string;
    const confMail = formData.get('confirm_new_email') as string;
    try {

        if (newMail !== confMail){
            return {success: false, message: "Emails do not match.",};
        }

        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        const now = new Date();

        await prisma.email_tokens.updateMany({
            where: {
                user_id: user.id,
                purpose: 'CHANGE_EMAIL',
                used_at: null,
                expires_at: { gt: now },
            },
            data: {expires_at: now},
        })

        await prisma.email_tokens.create({
            data: {
                user_id: user.id,
                token_hash: tokenHash,
                purpose: 'CHANGE_EMAIL',
                pending_email: newMail,
                expires_at: expiresAt,
            }
        });

        const appUrl = process.env.APP_URL;
        const verificationMailUrl = new URL('change-email-confirm', appUrl);
        verificationMailUrl.searchParams.set('token', token);

        try {
            await sendChangeMail(newMail, verificationMailUrl.toString(),);
        } catch {
            return {success: false, message: "The verification mail could not be sent."};
        }
        return { success: true, message: "Check your email to confirm the changes." };

    }catch (error) {
        return { success: false, message: "An error occurred during email verification." };
    }
}

export async function changePassword(formData: FormData){
    const oldPassword = formData.get('old_password') as string;
    const password = formData.get('new_password') as string;
    const confirm_password = formData.get('confirm_new_password') as string;
    const userSession = await getUserSession();
    if (userSession){
        try{
            const user = await prisma.users.findUnique({
                where: {
                    email: userSession.email,
                }
            })
            if (!user || !(await bcrypt.compare(oldPassword, user.password_hash))) {
                return {success: false, message: "The Current Password Is Incorrect.",};
            }
            const pwdCheck = checkPassword(password, confirm_password);
            if (!pwdCheck.pwdValid) {
                return { success: false, message: pwdCheck.message };
            }
            const hashPassword = await bcrypt.hash(password as string, 10);
            await prisma.users.update({
                where: {
                    email: user.email,
                },
                data: {
                    password_hash: hashPassword,
                }
            });
        } catch (error) {
            return { success: false, message: "An error occurred during connection to the database." };
        }
    } else {
        return {success: false, message: "User Not Authorized.",};
    }
    return await logoutUser();
}

export async function deleteUser() {
    const userSession = await getUserSession();
    if (userSession) {
        try {
            await prisma.users.delete({
                where: {
                    email: userSession.email,
                }
            });
            const cookiesStore = await cookies();
            cookiesStore.delete('session');
            redirect('/');
        } catch (error) {
            return { success: false, message: "An error occurred during deletion." }
        }
    } else {
        return { success: false, message: "User not authorized." }
    }
}

export async function getUserSession() {
    const cookiestore = await cookies();
    const token = cookiestore.get('session')?.value;
    if (! token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userMail = payload.email as string;
        const user = await prisma.users.findUnique({
            where : { email: userMail },
            omit: {
                password_hash: true,
            }
        });
        if (! user || !user.email_verified_at) {
            return null;
        }
        return user;
    } catch (error) {
        return null;
    }
}

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try{
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            }
        })
        if (user && await bcrypt.compare(password, user.password_hash)) {
            if (!user.email_verified_at) {
                return { success: false, message: "Please confirm your email before logging in." }
            }
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const token = await new SignJWT({ email: user.email })
                .setProtectedHeader({alg:'HS256'})
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(secret);
            const cookieStore = await cookies();
            cookieStore.set('session', token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24,
            });
            return { success: true, message: "Login successful" };
        }
        return { success: false, message: "Invalid email or password" };
    } catch (error) {
        return { success: false, message: "An error occurred during login" };
    }
}

export async function logoutUser() {
    const cookiesStore = await cookies();
    cookiesStore.delete('session');
    redirect('/');
}

export async function registerUser(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const { password, confirm_password, date_birth, ...regData } = rawData;
    const isoDate = getIsoDate(date_birth as string);
    const pwdCheck = checkPassword(password as string, confirm_password as string);
    if (!pwdCheck.pwdValid) {
        return { success: false, message: pwdCheck.message };
    }
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const appUrl = process.env.APP_URL;
    if (!appUrl) {
        throw new Error('Missing App URL.');
    }

    const verificationUrl = new URL('verify-email', appUrl);
    verificationUrl.searchParams.set('token', token);

    try {
        const hashPassword = await bcrypt.hash(password as string, 10);
        const user = await prisma.users.create({
            data: {
                ...(regData as any),
                password_hash: hashPassword,
                date_birth: isoDate,
                email_verified_at: null,
                email_tokens: {
                    create: {
                        token_hash: tokenHash,
                        purpose: 'REGISTER',
                        expires_at: expiresAt,
                    },
                },
            },
        });

        try {
            await sendRegistrationMail(user.email, verificationUrl.toString(),);
        } catch {
            return {success: false, message: "Account created, but the confirmation mail could not be sent."};
        }

        return { success: true, message: "Check Your Email To Confirm Your Registration." };
    } catch (error) {
        return { success: false, message: "An error occurred during registration." };
    }
}

export async function sendVerificationMail(formData:FormData) {
    const email = formData.get('email') as string;
    try{
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            }
        })
        if (user) {

            if (user.email_verified_at) {
                return { success: false, message: "User already verified." }
            }

            const appUrl = process.env.APP_URL;
            if (!appUrl) {
                throw new Error('Missing App URL.');
            }
    
            const token = randomBytes(32).toString('hex');
            const tokenHash = createHash('sha256').update(token).digest('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            const verificationUrl = new URL('verify-email', appUrl);
            verificationUrl.searchParams.set('token', token);

            const now = new Date();

            try {

                await prisma.email_tokens.updateMany({
                    where: {
                        user_id: user.id,
                        purpose: 'REGISTER',
                        used_at: null,
                        expires_at: { gt: now },
                    },
                    data: {expires_at: now},
                })

                await prisma.email_tokens.create({
                    data: {
                        token_hash: tokenHash,
                        purpose: 'REGISTER',
                        expires_at: expiresAt,
                        user_id: user.id,
                    },
                });

                try {
                    await sendRegistrationMail(user.email, verificationUrl.toString(),);
                } catch {
                    return {success: false, message: "The confirmation mail could not be sent."};
                }

                return { success: true, message: "Check Your Email To Confirm Your Registration." };

            } catch (error) {
                return {success: false, message: "An error occuring during the creation of the email."};
            }
        }
        return {success: false, message: "User not found."}
    } catch (error) {
        return {success: false, message: "An error occurred during login"};
    }
}

export async function updateUser(formData: FormData) {
    const userSession = await getUserSession();
    if (userSession) {
        const rawData = Object.fromEntries(formData.entries());
        Object.keys(rawData).forEach(key => {
            if (key.startsWith('$')) {
                delete rawData[key];
            }
        });
        const { date_birth, email, ...updData } = rawData;
        const isoDate = getIsoDate(date_birth as string);
        try{
            await prisma.users.update({
                where: {
                    email: userSession.email,
                },
                data: {
                    ...(updData as any),
                    date_birth: isoDate,
                }
            });
            revalidatePath('/profile');
            return { success: true};
        } catch (error) {
            return { success: false, message: "An error occurred during update." }
        }
    } else {
        return { success: false, message: "User not authorized." }
    }
}

export async function verifyChangeEmail(formData:FormData) {

    const token = formData.get('token');

    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        redirect('/verify-email?status=invalid');
    }
    
    const tokenHash = createHash('sha256').update(token).digest('hex');

    let verified = false;

    const user = await getUserSession();

    if(!user) {
        redirect('/login');
    }

    try {
        verified = await prisma.$transaction(async (tx) => {
            const emailToken = await tx.email_tokens.findUnique({
                where: {
                    token_hash: tokenHash,
                },
            });

            if (!emailToken?.pending_email || emailToken.user_id !== user.id) {
                return false;
            }

            const now = new Date();

            const consumed = await tx.email_tokens.updateMany({
                where: {
                    id: emailToken.id,
                    purpose: 'CHANGE_EMAIL',
                    used_at: null,
                    expires_at: {
                        gt: now,
                    },
                },
                data: {
                    used_at: now,
                },
            });

            if (consumed.count !== 1) {
                return false;
            }

            await tx.users.update({
                where: {
                    id: emailToken.user_id,
                },
                data: {
                    email_verified_at: now,
                    email: emailToken.pending_email,
                },
            });

            return true;

        });
    } catch {
        redirect('verify-email?status=error');
    }

    if (verified) {
        const cookieStore = await cookies();
        cookieStore.delete('session');
        redirect('/change-email-confirm?status=success');
    }

    redirect('/change-email-confirm?status=invalid');

}

export async function verifyRegistrationEmail(formData:FormData) {

    const token = formData.get('token');

    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        redirect('/verify-email?status=invalid');
    }
    
    const tokenHash = createHash('sha256').update(token).digest('hex');

    let verified = false;

    try {
        verified = await prisma.$transaction(async (tx) => {
            const emailToken = await tx.email_tokens.findUnique({
                where: {
                    token_hash: tokenHash,
                },
            });

            if (!emailToken) {
                return false;
            }

            const now = new Date();

            const consumed = await tx.email_tokens.updateMany({
                where: {
                    id: emailToken.id,
                    purpose: 'REGISTER',
                    used_at: null,
                    expires_at: {
                        gt: now,
                    },
                },
                data: {
                    used_at: now,
                },
            });

            if (consumed.count !== 1) {
                return false;
            }

            await tx.users.update({
                where: {
                    id: emailToken.user_id,
                },
                data: {
                    email_verified_at: now,
                },
            });

            return true;

        });
    } catch {
        redirect('verify-email?status=error');
    }

    redirect(verified ? 'verify-email?status=success' : 'verify-email?status=invalid');

}
