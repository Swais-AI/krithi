// app/api/teachers/route.js

import { NextResponse } from 'next/server';
import { withClient } from '../../../lib/db';

// GET - Fetch all teachers
export async function GET() {
  try {
    const result = await withClient(async (client) => {
      return await client.query(`
        SELECT 
          teacher_id as id,
          full_name as name,
          subject_name as subject,
          email_id as email,
          phone,
          is_active
        FROM sgs_teacher_master
        ORDER BY created_at DESC
      `);
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

// POST - Add a new teacher
export async function POST(request) {
  try {
    const body = await request.json();
    const { full_name, subject_name, email_id, phone } = body;

    const result = await withClient(async (client) => {
      return await client.query(
        `INSERT INTO sgs_teacher_master (
          full_name, subject_name, email_id, phone, is_active, created_at
        ) VALUES ($1, $2, $3, $4, true, NOW())
        RETURNING *`,
        [full_name, subject_name, email_id, phone]
      );
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json(
      { error: 'Failed to add teacher' },
      { status: 500 }
    );
  }
}

// PUT - Update a teacher
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, full_name, subject_name, email_id, phone, is_active } = body;

    const result = await withClient(async (client) => {
      return await client.query(
        `UPDATE sgs_teacher_master SET
          full_name = $1,
          subject_name = $2,
          email_id = $3,
          phone = $4,
          is_active = $5,
          modified_at = NOW()
        WHERE teacher_id = $6
        RETURNING *`,
        [full_name, subject_name, email_id, phone, is_active, id]
      );
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to update teacher' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a teacher
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    await withClient(async (client) => {
      return await client.query(
        'DELETE FROM sgs_teacher_master WHERE teacher_id = $1',
        [id]
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}
