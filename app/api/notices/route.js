import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        notice_id as id,
        notice_title as title,
        notice_text as message,
        applicable_class as role,
        notice_date as date,
        record_status as status,
        is_read
      FROM sgs_notice_board
      WHERE record_status = 'Active'
      ORDER BY notice_date DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, role, date } = body;
    
    const result = await pool.query(
      `INSERT INTO sgs_notice_board 
       (notice_title, notice_text, applicable_class, notice_date, record_status) 
       VALUES ($1, $2, $3, $4, 'Active') RETURNING *`,
      [title, message, role || 'all', date || new Date().toISOString().split('T')[0]]
    );
    
    return NextResponse.json({ 
      success: true,
      notice: {
        id: result.rows[0].notice_id,
        title: result.rows[0].notice_title,
        message: result.rows[0].notice_text,
        role: result.rows[0].applicable_class,
        date: result.rows[0].notice_date,
        status: result.rows[0].record_status,
        is_read: result.rows[0].is_read
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding notice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, message, role, date } = body;
    
    await pool.query(
      `UPDATE sgs_notice_board 
       SET notice_title = $1, notice_text = $2, applicable_class = $3, notice_date = $4
       WHERE notice_id = $5`,
      [title, message, role, date, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query(
      `UPDATE sgs_notice_board SET record_status = 'Deleted' WHERE notice_id = $1`,
      [id]
    );
    
    return NextResponse.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
