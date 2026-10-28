import { getUserSession, logoutUser } from "@/app/actions/auth";
import Link from "next/link";

export default async function Home() {

  const user = await getUserSession();

  return(
    <main className="flex flex-col min-h-screen items-center justify-center bg-slate-50 gap-6">
      <h1 className="text-6xl font-extrabold text-blue-600">Welcome</h1>
        {user ? (
            <div className="flex gap-4">
              <form action={logoutUser} className="flex flex-col gap-4">
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Logout</button>
              </form>
              <Link href="/profile" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">View Profile</Link>
            </div>
          ): (
            <div className="flex gap-4">
              <Link href="/login" className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium">Login</Link>
              <Link href="/register" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Register</Link>
            </div>
          )
        }
    </main>
  )

}
