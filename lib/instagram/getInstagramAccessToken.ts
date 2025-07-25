import { prisma } from "@/lib/db";
export async function getInstagramAccessToken() {
  const integration = await prisma.integration.findFirst({
    where: { type: "INSTAGRAM" },
    select: { accessToken: true }
  });

  return integration?.accessToken || null;
}