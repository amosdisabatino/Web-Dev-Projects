import { getUserSession, updateUser } from "@/app/actions/auth";
import { redirect } from 'next/navigation';

export default async function Profile() {
    const user = await getUserSession();

    if (!user) {
        redirect('/');
    }

    const formattedDAte = user?.date_birth ? new Date(user.date_birth).toISOString().split('T')[0] : '';


    return (
        <main className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Create Account</h1>
            <form action={updateUser} className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Name:</label>
                        <input type="text" name="name" defaultValue={user.name || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Surname:</label>
                        <input type="text" name="surname" defaultValue={user.surname || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Of Birth:</label>
                        <input type="date" name="date_birth" defaultValue={formattedDAte || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Place Of Birth:</label>
                        <input type="text" name="birth_place" defaultValue={user.birth_place || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                    </div>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email:</label>
                    <input type="email" readOnly name="email" defaultValue={user.email as string} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
                <button type="submit" className="bg-blue-600 text-white p-2 rounded">Update Values</button>
            </form>
        </main>
    )

}
