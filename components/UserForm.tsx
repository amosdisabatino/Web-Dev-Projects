'use client';
import Link from "next/link"; 

export default function UserForm({mode, initialData, onSubmit, message, pwdmessage}: {mode: 'register' | 'update', initialData?: any, onSubmit: any, message?: string, pwdmessage?: string}) {

    const formattedDAte = initialData?.date_birth ? new Date(initialData.date_birth).toISOString().split('T')[0] : '';

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name:</label>
                    <input type="text" name="name" defaultValue={initialData?.name || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Surname:</label>
                    <input type="text" name="surname" defaultValue={initialData?.surname || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date Of Birth:</label>
                    <input type="date" name="date_birth" defaultValue={formattedDAte || ''}  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Place Of Birth:</label>
                    <input type="text" name="birth_place" defaultValue={initialData?.birth_place || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
                </div>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email:</label>
                <input type="email" name="email" readOnly={Boolean(initialData?.email)} defaultValue={initialData?.email || ''} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" required/>
            </div>
            {
                mode === 'register' && (
                    <>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password:</label>
                                <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" type="password" name="password" required/>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Repeat Password:</label>
                                <input className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" type="password" name="confirm_password" required/>
                            </div>
                        </div>
                        {pwdmessage && <p className="text-red-600 text-sm mt-2">{pwdmessage}</p>}
                        {message && <p className="mt-4 text-sm">{message}</p>}
                        <div className="flex gap-4">
                            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Register</button>
                            <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Back Home</Link>
                        </div>
                    </>
                )
            }
            {
                mode === 'update' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button type="submit" className="w-full text-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Update Values</button>
                        <Link href="/change-password" className="w-full text-center block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Change Password</Link>
                        <Link href="/change-email" className="w-full text-center block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Change Email</Link>
                        <Link href="/" className="w-full text-center block px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Back Home</Link>
                    </div>
                )
            }
        </form>
    );

}