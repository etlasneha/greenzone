import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Remove the greenzone_user cookie
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': 'greenzone_user=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
    },
  });
}
