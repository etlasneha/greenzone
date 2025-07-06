import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '../../lib/users';

export async function GET(req: NextRequest) {
  // Get user from cookie
  const cookie = req.cookies.get('greenzone_user');
  let userObj = null;
  try {
    userObj = cookie?.value ? JSON.parse(decodeURIComponent(cookie.value)) : null;
  } catch {
    userObj = null;
  }
  if (!userObj || !userObj.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const users = await readUsers();
  const user = users.find((u: any) => u.email === userObj.email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
