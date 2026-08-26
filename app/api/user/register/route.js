import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

export async function POST(request) {
  try {
    const { username, email, password, role, school_id } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT user_id FROM sgs_users_masters WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO sgs_users_masters 
       (username, email, password_hash, role, school_id, is_active, created_at) 
       VALUES ($1, $2, $3, $4, $5, true, NOW()) 
       RETURNING user_id, username, email, role, school_id`,
      [username, email, hashedPassword, role || 'user', school_id || null]
    );

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
