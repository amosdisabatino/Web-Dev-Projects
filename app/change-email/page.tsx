'use server';

import { getUserSession } from "@/app/actions/auth";
import { redirect } from 'next/navigation';
import ChangeMailForm from "./ChangeMailForm";

export default async function ChangePassword() {
    const user = await getUserSession();

    if (!user) {
        redirect('/');
    }

    return (
        <ChangeMailForm initialData={user}/>
    )

}
