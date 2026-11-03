'use server';

import { getUserSession } from '@/app/actions/auth';
import LoginFormClient from './LoginFormClient';
import { redirect } from 'next/navigation';

export default async function Login() {
    const user = await getUserSession();

    if (user) {
        redirect('/');
    }

    return (
        <LoginFormClient />
    )
}
