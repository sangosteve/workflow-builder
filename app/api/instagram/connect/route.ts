import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.INSTAGRAM_CLIENT_ID!;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;
    const scope = "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights";

    const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    
    return NextResponse.redirect(authUrl);
}