import { prisma } from '@/lib/db'
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getOrCreateUser() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    throw new Error('Not authenticated');
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        fullName: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      },
    });
  }

  return user;
}