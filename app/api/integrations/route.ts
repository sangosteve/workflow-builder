import { NextResponse } from 'next/server';
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const integrations = await prisma.integration.findMany();
    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}