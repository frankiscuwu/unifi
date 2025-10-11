import { authOptions } from "./api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  // Get the current session on the server
  const session = await getServerSession(authOptions);

  // If we have a valid Spotify access token, send to the app home
  if (session?.accessToken) {
    redirect("/home");
  }

  // Otherwise, send to login
  redirect("/login");
}
