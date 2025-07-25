import {getInstagramAccessToken} from "./getInstagramAccessToken";
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
