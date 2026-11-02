'use server';

import { getUserSession, updateUser } from "@/app/actions/auth";
import { redirect } from 'next/navigation';
import UserForm from "@/components/UserForm";

export default async function Profile() {
    const user = await getUserSession();

    if (!user) {
        redirect('/');
    }

    const formattedDAte = user?.date_birth ? new Date(user.date_birth).toISOString().split('T')[0] : '';


    return (
        <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h1>
            <UserForm mode='update' initialData={user} onSubmit={updateUser} />
        </main>
    )

}
