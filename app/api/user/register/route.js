import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, email, password, role, school_id } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await sql`
      SELECT user_id FROM sgs_users_masters 
      WHERE email = ${email} OR username = ${username}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO sgs_users_masters 
      (username, email, password_hash, role, school_id, is_active, created_at) 
      VALUES (${username}, ${email}, ${hashedPassword}, ${role || 'user'}, ${school_id}, true, NOW())
      RETURNING user_id, username, email, role, school_id
    `;

    return NextResponse.json({ success: true, user: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
