'use client';

import Link from "next/link";
import { useState } from "react";
import { sendVerificationMail } from "../actions/auth";

export default function SendVerificationMailForm() {
    const [message, setMessage] = useState('');

    async function manageVerificationMail(formData: FormData) {
        const response = await sendVerificationMail(formData);
        setMessage(response.message || '');
    }

    return(
        <div className="p-8 max-w-md mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">Resend Verification Email</h2>
            <form action={manageVerificationMail} className="flex flex-col gap-4">
                <input type="email" name="email" placeholder="Email" required className="border p-2 rounded"/>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Send Verification Link</button>
                <Link href="/" className="rounded bg-blue-600 p-2 text-center text-white">Back Home</Link>
            </form>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    )
}
