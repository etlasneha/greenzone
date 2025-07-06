import { NextRequest, NextResponse } from 'next/server';
import { readUsers, updateUser } from '../../lib/users';

// Helper to get the current user from the session cookie
async function getSessionUser(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/greenzone_user=([^;]+)/);
  if (!match) return null;
  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    return user;
  } catch (err) {
    console.error('Session cookie parse error:', err);
    return null;
  }
}

// POST: Promote or demote a user (admin only)
export async function POST(req: NextRequest) {
  try {
    const { email, newRole, promotedBy } = await req.json();
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'No session or invalid session.' }, { status: 403 });
    }
    
    const users = await readUsers();
    const adminUser = users.find((u: any) => u.email === sessionUser?.email);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: not an admin.' }, { status: 403 });
    }
    
    const user = users.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (user.role === newRole) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 400 });
    }
    
    const updates: any = { role: newRole };
    if (newRole === 'admin' && promotedBy) {
      updates.promotedBy = promotedBy;
    }
    
    try {
      await updateUser(email, updates);
      const updatedUser = { ...user, ...updates };
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error('Failed to update user in database:', err);
      return NextResponse.json({ error: 'Failed to update user role. Database error.' }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Unexpected error in promote-user:', err);
    return NextResponse.json({ error: 'Unexpected server error: ' + err.message }, { status: 500 });
  }
}
