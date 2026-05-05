import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        user_id, 
        full_name as name, 
        email_id as email, 
        mobile_no as phone,
        user_type as interest,
        is_active,
        registration_complete,
        record_status,
        created_datetime as created_at
      FROM users_master 
      WHERE record_status != 'D' OR record_status IS NULL
    `;
    let params = [];
    let paramIndex = 1;
    
    // Search filter
    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR email_id ILIKE $${paramIndex} OR mobile_no ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Status filter
    if (status && status !== 'All') {
      if (status === 'A') {
        query += ` AND is_active = true AND registration_complete = true`;
      } else if (status === 'P') {
        query += ` AND (is_active = false OR registration_complete = false)`;
      } else if (status === 'I') {
        query += ` AND is_active = false AND registration_complete = true`;
      } else if (status === 'D') {
        query += ` AND record_status = 'D'`;
      }
    }
    
    query += ' ORDER BY user_id DESC';
    
    const result = await pool.query(query, params);
    
    // Transform to match frontend expected format
    const users = result.rows.map(user => {
      let statusLetter = 'P'; // Default pending
      if (user.is_active === true && user.registration_complete === true) {
        statusLetter = 'A'; // Active
      } else if (user.is_active === false && user.registration_complete === true) {
        statusLetter = 'I'; // Inactive
      } else if (user.record_status === 'D') {
        statusLetter = 'D'; // Deleted
      }
      
      return {
        ...user,
        status: statusLetter
      };
    });
    
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}