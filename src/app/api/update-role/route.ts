import { NextRequest, NextResponse } from 'next/server';
import { readUsers, updateUser } from '../lib/users';

async function getSessionUser(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  console.log('[update-role] Incoming cookies:', cookie);
  const match = cookie.match(/greenzone_user=([^;]+)/);
  if (!match) {
    console.log('[update-role] greenzone_user cookie not found');
    return null;
  }
  try {
    const user = JSON.parse(decodeURIComponent(decodeURIComponent(match[1])));
    console.log('[update-role] Parsed session user:', user);
    return user;
  } catch (err) {
    console.log('[update-role] Failed to parse session user:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      console.log('[update-role] No session or invalid session.');
      return NextResponse.json({ error: 'No session or invalid session.' }, { status: 403 });
    }
    const users = await readUsers();
    const adminUser = users.find((u: any) => u.email === sessionUser?.email);
    console.log('[update-role] Admin user lookup:', adminUser);
    if (!adminUser || adminUser.role !== 'admin') {
      console.log('[update-role] Unauthorized: not an admin.');
      return NextResponse.json({ error: 'Unauthorized: not an admin.' }, { status: 403 });
    }
    const user = users.find((u: any) => u.email === email);
    console.log('[update-role] Target user lookup:', user);
    if (!user) {
      console.log('[update-role] User not found:', email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.role === role) {
      console.log('[update-role] User already has this role:', email, role);
      return NextResponse.json({ error: 'User already has this role' }, { status: 400 });
    }
    try {
      console.log('[update-role] Updating user in database...');
      await updateUser(email, { role });
      console.log('[update-role] User updated successfully in database.');
      const updatedUser = { ...user, role };
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error('[update-role] Failed to update user role. Database error.', err);
      return NextResponse.json({ error: 'Failed to update user role. Database error.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[update-role] Unexpected server error:', err);
    return NextResponse.json({ error: 'Unexpected server error: ' + err.message }, { status: 500 });
  }
}
