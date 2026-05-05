import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request) {
  try {
    const { userIds, newStatus } = await request.json();
    
    if (!userIds || userIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No users selected' }, { status: 400 });
    }
    
    let updateFields = {};
    let statusMessage = '';
    
    // Map status letter to database fields
    if (newStatus === 'A') {
      updateFields = { is_active: true, registration_complete: true };
      statusMessage = 'activated';
    } else if (newStatus === 'I') {
      updateFields = { is_active: false, registration_complete: true };
      statusMessage = 'deactivated';
    } else if (newStatus === 'P') {
      updateFields = { is_active: false, registration_complete: false };
      statusMessage = 'set to pending';
    } else if (newStatus === 'D') {
      updateFields = { record_status: 'D' };
      statusMessage = 'deleted';
    }
    
    const setClause = Object.keys(updateFields)
      .map((key, i) => `${key} = $${i + 2}`)
      .join(', ');
    
    const placeholders = userIds.map((_, i) => `$${i + Object.keys(updateFields).length + 2}`).join(',');
    const query = `
      UPDATE users_master 
      SET ${setClause}
      WHERE user_id IN (${placeholders}) 
      RETURNING user_id, full_name as name
    `;
    
    const params = [...Object.values(updateFields), ...userIds];
    const result = await pool.query(query, params);
    
    return NextResponse.json({ 
      success: true, 
      message: `${result.rowCount} user(s) ${statusMessage}`,
      updatedUsers: result.rows 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}