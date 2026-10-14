'use server'
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';

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
            const cookieStore = await cookies();
            cookieStore.set('session', 'tuo_jwt_token_qui',{
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

export async function registerUser(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries());
    const { password, ...regData } = rawData;
    try {
        const hashPassword = await bcrypt.hash(password as string, 10);
        await prisma.users.create({
            data: {
                ...(regData as any),
                password_hash: hashPassword,
            }
        });
        return { success: true, message: "Register Done." };
    } catch (error) {
        return { success: false, message: "An error occurred during registration." };
    }
}
