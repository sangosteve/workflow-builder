import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db";
import { requireDbUser } from "@/lib/requireDbUser";

export async function GET() {
  try {
    const user = await requireDbUser("/sign-in");  // redirects if no user
    const integrations = await prisma.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        type: true,
        externalUserId: true,
        username: true,
        // add other fields you want to expose
      },
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch integrations" },
      { status: 401 }
    );
  }
}