'use server';

import { redirect } from 'next/navigation';
import { getUserSession } from '@/app/actions/auth';
import RegisterFormClient from './RegisterFormClient';

export default async function Register() {

    const user = await getUserSession();

    if (user) {
        redirect('/');
    }

    return (
        <RegisterFormClient />
    )
}
