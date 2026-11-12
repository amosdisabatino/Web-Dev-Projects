'use server'
import { checkPassword } from '@/lib/validation';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
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
    const oldMail = formData.get('email') as string;
    const newMail = formData.get('new_email') as string;
    const confMail = formData.get('confirm_new_email') as string;
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: oldMail,
            }
        })
        if (!user) {
            return {success: false, message: "The Current Email Is Incorrect.",};
        }
        if (newMail !== confMail){
            return {success: false, message: "Emails do not match.",};
        }
        await prisma.users.update({
            where: {
                email: user.email,
            },
            data: {
                email: confMail,
            }
        });
    }catch (error) {
        return { success: false, message: "An error occurred during connection to the database." };
    }
    return await logoutUser();
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
        console.error(error)
        return { success: false, message: "An error occurred during registration." };
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
