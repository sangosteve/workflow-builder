import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { Webhook } from "svix"; 

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers) as ClerkWebhookEvent;

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      
  if (!email) {
    throw new Error("User email is missing from Clerk webhook data");
  }

      await prisma.user.create({
        data: {
          id, // Clerk's ID
          email,
          fullName: [first_name, last_name].filter(Boolean).join(" ") || null,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}