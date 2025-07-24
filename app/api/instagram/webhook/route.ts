import { NextRequest, NextResponse } from "next/server";

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

    // Basic check for Instagram DMs
    if (body.object === "instagram" && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        const messagingEvents = entry.messaging;
        if (messagingEvents && Array.isArray(messagingEvents)) {
          for (const messageEvent of messagingEvents) {
            if (messageEvent.message) {
              console.log("💬 New DM received:", messageEvent.message.text);
              // TODO: Store to DB or trigger notification, etc.
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in Instagram webhook POST handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}