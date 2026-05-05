import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN record_status = 'D' THEN 1 ELSE 0 END) as deleted,
        SUM(CASE 
          WHEN record_status != 'D' AND is_active = true AND registration_complete = true THEN 1 
          ELSE 0 
        END) as active,
        SUM(CASE 
          WHEN record_status != 'D' AND is_active = false AND registration_complete = true THEN 1 
          ELSE 0 
        END) as inactive,
        SUM(CASE 
          WHEN record_status != 'D' AND (is_active = false OR registration_complete = false) 
               AND NOT (is_active = false AND registration_complete = true) THEN 1 
          ELSE 0 
        END) as pending
      FROM users_master
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({ 
      success: true, 
      stats: {
        active: parseInt(result.rows[0].active) || 0,
        inactive: parseInt(result.rows[0].inactive) || 0,
        pending: parseInt(result.rows[0].pending) || 0,
        deleted: parseInt(result.rows[0].deleted) || 0,
        total: parseInt(result.rows[0].total) || 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}