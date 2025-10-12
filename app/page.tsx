import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getServerSession(authOptions);

    // No session at all → login
    if (!session) {
        redirect("/login");
    }

    // If session exists but token expired or failed to refresh → login
    const expires =
        (session as any)?.token?.expires ||
        (session as any)?.accessTokenExpires;
    if (expires && Date.now() > expires) {
        redirect("/login");
    }

    // Otherwise → home
    redirect("/home");
}
