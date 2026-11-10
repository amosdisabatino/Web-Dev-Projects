'use client';

import { changePassword} from "@/app/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function ChangePwdForm() {
    const [message, setMessage] = useState('');

    async function handleChangePwd(event: React.SyntheticEvent<HTMLFormElement>) {

        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const isConfirmed = window.confirm("Are you sure you want to change your password? This action cannot be undone.");
        if (!isConfirmed) {
            return;
        }

        const response = await changePassword(formData);
        setMessage(response?.message as string);
    }

    return (
        <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <form onSubmit={handleChangePwd} className="space-y-4">
                <div className="p-8 max-w-md mx-auto mt-20">
                    <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                    <div className="flex-1">
                        <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-4" type="password" name="old_password" placeholder="Old Password" required/>
                        <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-4" type="password" name="new_password" placeholder="New Password" required/>
                        <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mt-4" type="password" name="confirm_new_password" placeholder="Confirm New Password" required/>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm mt-4">Change Password</button>
                        <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm mt-4">Back Home</Link>
                    </div>
                    {message && <p className="mt-4 text-sm">{message}</p>}
                </div>
            </form>
        </main>
    );

}
