import { NextRequest, NextResponse } from 'next/server';
import { readUsers } from '../../lib/users';

export async function GET(req: NextRequest) {
  try {
    const users = await readUsers();
    // Never send passwords to the frontend
    const safeUsers = users.map(({ password, ...rest }: any) => rest);
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
