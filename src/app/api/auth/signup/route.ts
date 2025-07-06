import { NextRequest, NextResponse } from 'next/server';
import { readUsers, addUser } from '../../lib/users';
import { addWelcomeNotification } from '../../lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    const users = await readUsers();
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    
    // Always set role to 'user' on signup, never from frontend
    const user = { id: Date.now().toString(), email, name, password, role: 'user' };
    await addUser(user);
    
    // Send welcome notification to new user
    try {
      await addWelcomeNotification(email, name);
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
      // Don't fail signup if notification fails
    }
    
    return NextResponse.json({ message: 'Signup successful' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
