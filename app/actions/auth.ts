'use server'
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import { jwtVerify, SignJWT } from 'jose';

function getIsoDate(rawDate: string) {
    if (rawDate) {
        const isoDate = new Date(rawDate).toISOString();
        return isoDate;
    } else {
        return false;
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
    try {
        const hashPassword = await bcrypt.hash(password as string, 10);
        await prisma.users.create({
            data: {
                ...(regData as any),
                password_hash: hashPassword,
                date_birth: isoDate,
            }
        });
        return { success: true, message: "Register Done." };
    } catch (error) {
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
        const { date_birth, ...updData } = rawData;
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
