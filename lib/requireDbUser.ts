import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";

/**
 * Ensures a user is both signed in with Clerk and exists in our DB.
 * 
 * @param redirectIfMissing - Optional path to redirect if user not found (only works in server components / pages)
 * @returns The DB user object
 * @throws Redirects or throws an error if not authenticated or not in DB
 */
export async function requireDbUser(redirectIfMissing?: string) {
  const { userId } = await auth();
  console.log("userId",userId)

  if (!userId) {
    if (redirectIfMissing) redirect("/sign-in");
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    if (redirectIfMissing) redirect(redirectIfMissing);
    throw new Error("User not found in DB");
  }

  return user;
}
