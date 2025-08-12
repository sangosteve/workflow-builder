import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireDbUser } from '@/lib/requireDbUser';

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID!;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET!;
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const user = await requireDbUser();

    // Step 1: Exchange code for short-lived access token
    const shortTokenRes = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_CLIENT_ID,
          client_secret: INSTAGRAM_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code: code,
        }),
      }
    );

    const shortTokenData = await shortTokenRes.json();
    if (!shortTokenRes.ok) {
      return NextResponse.json(shortTokenData, { status: shortTokenRes.status });
    }

    const shortAccessToken = shortTokenData.access_token;
    // Step 2: Exchange short-lived token for long-lived token
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${shortAccessToken}`,
      {
        method: 'GET'
      }
    );

    const longTokenData = await longTokenRes.json();
    if (!longTokenRes.ok) {
      console.error("Error getting long-lived token:", longTokenData);
      return NextResponse.json(longTokenData, { status: longTokenRes.status });
    }

    const longAccessToken = longTokenData.access_token;

    // Step 3: Get Instagram user ID and info using the short-lived token
    const userInfoRes = await fetch(
      `https://graph.instagram.com/v23.0/me?fields=id,username&access_token=${shortAccessToken}`
    );

    const userInfo = await userInfoRes.json();
    if (!userInfoRes.ok) {
      console.error("Error getting IG user info:", userInfo);
      return NextResponse.json(userInfo, { status: userInfoRes.status });
    }

    const instagramUserId = userInfo.id;
    const instagramUsername = userInfo.username;

    // Step 4: Save or update the integration in the database
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        userId: user.id,
        type: "INSTAGRAM"
      }
    });

    if (existingIntegration) {
      // Update existing integration
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          accessToken: longAccessToken,
          externalUserId: instagramUserId,
          username: instagramUsername,
        }
      });
    } else {
      // Create new integration
      await prisma.integration.create({
        data: {
          type: "INSTAGRAM",
          accessToken: longAccessToken,
          externalUserId: instagramUserId,
          username: instagramUsername,
          userId: user.id
        }
      });
    }

    // Step 5: Redirect to success page
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/integrations`, req.url)
    );
  } catch (error) {
    console.error("Error in Instagram callback:", error);
    return NextResponse.json({ error: "Failed to process Instagram integration" }, { status: 500 });
  }
}