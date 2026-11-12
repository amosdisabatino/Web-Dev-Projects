'use client';

import { checkPassword } from '@/lib/validation';
import {registerUser} from '@/app/actions/auth';
import { useState } from 'react';
import Userform from '@/components/UserForm';


export default function RegisterFormClient() {

    const [message, setMessage] = useState('');
    const [pwdmessage, setPwdMessage] = useState('');

    async function clientSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setPwdMessage('');
        setMessage('');
        const form = event.currentTarget;
        const formData = new FormData(form);
        const pwd = formData.get('password') as string;
        const conf_pwd = formData.get('confirm_password') as string;
        const pwdCheck = checkPassword(pwd,conf_pwd);
        if (!pwdCheck.pwdValid) {
            setPwdMessage(pwdCheck.message as string);
            return;
        }
        const response = await registerUser(formData);
        setMessage(response.message as string);
        if (response.success) {
            form.reset();
        }
    }

    return (
        <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h1>
            <Userform mode='register' onSubmit={clientSubmit} message={message} pwdmessage={pwdmessage} />
        </main>
    )

}
