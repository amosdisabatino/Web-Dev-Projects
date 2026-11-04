'use client';

import { deleteUser } from "@/app/actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function DeleteFormClient() {
    const [message, setMessage] = useState('');
    
    async function handleDelete(event: React.SyntheticEvent<HTMLFormElement>) {

        event.preventDefault();

        const isConfirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (!isConfirmed) {
            return;
        }
        
        const response = await deleteUser();
        setMessage(response.message);
    }

    return (
        <form onSubmit={handleDelete} className="space-y-4">
            <div className="p-8 max-w-md mx-auto mt-20">
                <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
                <p className="mb-4">This action is irreversible. Please confirm your decision.</p>
                <div className="flex gap-4">
                    <button type="submit" className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition">Delete Account</button>
                    <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Back Home</Link>
                </div>
                {message && <p className="mt-4 text-sm">{message}</p>}
            </div>
        </form>
    );

}
