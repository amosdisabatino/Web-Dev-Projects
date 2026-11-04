'use server';

import DeleteFormClient from "./DeleteFormClient";
import { getUserSession } from "../actions/auth";
import { redirect } from 'next/navigation';

export default async function DeletePage() {

    const user = await getUserSession();

    if (!user) {
        redirect('/');
    }

    return (
        <DeleteFormClient />
    );

}
