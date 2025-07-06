import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '../../lib/users';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const users = await readUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Set a cookie for session (store full user info as JSON string)
    const res = NextResponse.json({ id: user.id, email: user.email, role: user.role });
    res.cookies.set('greenzone_user', encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, role: user.role })), {
      path: '/',
      httpOnly: false, // If you want to access it from JS, otherwise set to true for security
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
