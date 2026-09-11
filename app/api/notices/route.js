import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const notices = await sql`
      SELECT 
        notice_id as id,
        notice_title as title,
        notice_text as message,
        notice_date as date,
        applicable_class,
        record_status as status
      FROM sgs_notice_board
      WHERE record_status = 'Active'
      ORDER BY notice_date DESC
    `;
    return NextResponse.json(notices);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, title, message, date, applicable_class } = body;

    // FIX: If id is provided, UPDATE instead of INSERT
    if (id) {
      const result = await sql`
        UPDATE sgs_notice_board 
        SET 
          notice_title = ${title}, 
          notice_text = ${message}, 
          notice_date = ${date || new Date().toISOString().split('T')[0]}, 
          applicable_class = ${applicable_class || 'all'}
        WHERE notice_id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        success: true, 
        notice: result[0],
        message: 'Notice updated successfully' 
      });
    }

    // INSERT new notice
    const result = await sql`
      INSERT INTO sgs_notice_board (
        notice_title, notice_text, notice_date, applicable_class, record_status
      ) VALUES (
        ${title}, ${message}, ${date || new Date().toISOString().split('T')[0]}, 
        ${applicable_class || 'all'}, 'Active'
      ) RETURNING *
    `;

    return NextResponse.json({ 
      success: true, 
      notice: result[0],
      message: 'Notice created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding notice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_notice_board 
      SET record_status = 'Deleted' 
      WHERE notice_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notice deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
