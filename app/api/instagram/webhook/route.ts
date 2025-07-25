import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // already exists in your project


//GET ACCESS TOKEN FROM THE DB
async function getInstagramAccessToken() {
  const integration = await prisma.integration.findFirst({
    where: { type: "INSTAGRAM" },
    select: { accessToken: true }
  });

  return integration?.accessToken || null;
}


export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const challenge = searchParams.get("hub.challenge");
    const verifyToken = searchParams.get("hub.verify_token");

    if (
      mode === "subscribe" &&
      verifyToken === process.env.INSTAGRAM_VERIFY_TOKEN
    ) {
      console.log("✅ Verified. Returning challenge:", challenge);
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } else {
      console.error("❌ Invalid token or mode:", {
        expected: process.env.INSTAGRAM_VERIFY_TOKEN,
        got: verifyToken,
      });
      return new Response("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("❌ Error verifying webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Instagram Webhook Event:", JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const messagingEvent = entry?.messaging?.[0];

    if (messagingEvent) {
      const senderId = messagingEvent.sender?.id;
      const recipientId = messagingEvent.recipient?.id;

      console.log("👤 Sender ID:", senderId);
      console.log("📬 Recipient ID:", recipientId);

      if (senderId) {
        // 👇 Auto-reply
        await sendInstagramReply(senderId, "Hie from earth!!!");
      }
    } else {
      console.warn("⚠️ No messaging event found in webhook payload.");
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in Instagram webhook POST handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


//SEND INSTAGRAM RESPONSE
export async function sendInstagramReply(recipientId: string, text: string) {
  console.log("📤 Sending reply to:", recipientId);

  const accessToken = await getInstagramAccessToken();

  if (!accessToken) {
    console.error("❌ No Instagram access token found");
    return;
  }

  const IG_ID = "17841466793337819"; // your tested IG ID

  const res = await fetch(
    `https://graph.instagram.com/v23.0/${IG_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Error sending IG reply:", data);
  } else {
    console.log("✅ Message sent to IG user:", recipientId);
  }
}
