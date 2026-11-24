'use client';

import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginFormClient() {
    const [message, setMessage] = useState('');
    const router = useRouter();

    async function clientSubmit(formData: FormData) {
        const response = await loginUser(formData);
        if (response.success){
            router.push('/');
            router.refresh();
        }
        else {
            setMessage(response.message || '');
        }
    }

    return(
        <div className="p-8 max-w-md mx-auto mt-20">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form action={clientSubmit} className="flex flex-col gap-4">
                <input type="email" name="email" placeholder="Email" required className="border p-2 rounded"/>
                <input type="password" name="password" placeholder="Password" required className="border p-2 rounded"/>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
                <Link href="/send-verification" className="rounded bg-blue-600 p-2 text-center text-white">Send New Verification Link</Link>
                <Link href="/" className="rounded bg-blue-600 p-2 text-center text-white">Back Home</Link>
            </form>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    )
}
