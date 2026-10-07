'use client'

import {registerUser} from '@/app/actions/auth';
import { useState } from 'react';

export default function Register() {
    const [message, setMessage] = useState('');

    async function clientSubmit(formData: FormData) {
        const response = await registerUser(formData);
        setMessage(response.message);
    }

    return (
        <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h1>
            <form action={clientSubmit}className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email:</label>
                    <input type="email" name="email" className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password:</label>
                    <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" type="password" name="password" required/>
                </div>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Registrati</button>
                {message && <p className="mt-4 text-sm">{message}</p>}
            </form>
        </main>
    )
}
