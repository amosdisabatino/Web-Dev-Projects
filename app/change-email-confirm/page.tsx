import Link from "next/link";
import { verifyChangeEmail } from "@/app/actions/auth";

type VerifyEmailPageProps = {
    searchParams: Promise<{
        token?: string | string[];
        status?: string | string[];
    }>;
}


export default async function VerifyChangeEmailPage({searchParams} : VerifyEmailPageProps) {
    const { token, status } = await searchParams;

    let message = '';

    if (status === 'success') {
        message = "Email confirmed. You can now log in.";
    } else if (status === 'invalid') {
        message = "Invalid, expired or already used link.";
    } else if (status === 'error') {
        message = "Email confirmation failed. Please try again later.";
    }

    const hasValidToken = typeof token === 'string' &&  /^[a-f0-9]{64}$/.test(token);

    return (
        <main className="max-w-md mx-auto mt-12 p-6">
            <h1 className="text-2xl font-bold mb-4">
                Confirm Your Email
            </h1>
            {
                message ? (<p>{message}</p>) : hasValidToken ? (
                    <form action={verifyChangeEmail}>
                        <input type="hidden" name="token" value={token}/>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Confirm Email</button>
                    </form>
                ) : (
                    <p>Invalid Confirmation Link.</p>
                )
            }
            <Link href="/login" className="block mt-4 underline">Go To Login</Link>

        </main>
    );

}
