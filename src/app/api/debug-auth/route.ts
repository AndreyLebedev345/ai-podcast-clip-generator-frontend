import { NextResponse } from "next/server";

export async function GET() {
  // Only show in development or with special header
  const debugInfo = {
    environment: process.env.NODE_ENV,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    authSecretLength: process.env.AUTH_SECRET?.length,
    hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
    googleIdFormat: process.env.AUTH_GOOGLE_ID ?
      `${process.env.AUTH_GOOGLE_ID.substring(0, 10)}...${process.env.AUTH_GOOGLE_ID.slice(-4)}` :
      "not set",
    hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
    googleSecretLength: process.env.AUTH_GOOGLE_SECRET?.length,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlType: process.env.DATABASE_URL?.includes("postgresql") ? "postgres" :
                     process.env.DATABASE_URL?.includes("mysql") ? "mysql" :
                     process.env.DATABASE_URL?.includes("file:") ? "sqlite" : "unknown",
    baseUrl: process.env.BASE_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    vercelUrl: process.env.VERCEL_URL,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(debugInfo);
}