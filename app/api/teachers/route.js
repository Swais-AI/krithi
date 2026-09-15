import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const teachers = await sql`
      SELECT 
        teacher_id as id,
        full_name as name,
        subject_name as subject,
        qualification,
        class_id,
        section_1,
        section_2,
        role,
        is_class_teacher,
        subjects,
        phone as contact,
        email_id as email,
        is_active,
        CASE WHEN is_active = true THEN 'Active' ELSE 'Inactive' END as status
      FROM sgs_teacher_master
      WHERE is_active = true OR is_active IS NULL
      ORDER BY teacher_id
    `;
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      teacher_id, name, subject, qualification, class_id,
      section_1, section_2, role, is_class_teacher,
      subjects, contact, email, status,
    } = body;

    if (!teacher_id || !name || !email) {
      return NextResponse.json({ error: 'Teacher ID, Name and Email are required' }, { status: 400 });
    }

    if (!teacher_id.match(/^[TH]/)) {
      return NextResponse.json({ error: 'Teacher ID must start with T or H' }, { status: 400 });
    }

    // ✅ FIX: Convert empty string to null for bigint column
    const classIdValue = class_id && String(class_id).trim() !== '' ? parseInt(class_id) : null;

    const result = await sql`
      INSERT INTO sgs_teacher_master (
        teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active
      ) VALUES (
        ${teacher_id}, ${name}, ${subject}, ${qualification}, ${classIdValue},
        ${section_1}, ${section_2}, ${role || 'Teacher'}, ${is_class_teacher || false},
        ${subjects}, ${contact}, ${email}, ${status === 'Active'}
      ) RETURNING *
    `;

    return NextResponse.json({ success: true, teacher: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      teacher_id, name, subject, qualification, class_id,
      section_1, section_2, role, is_class_teacher,
      subjects, contact, email, status,
    } = body;

    if (!teacher_id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // ✅ FIX: Convert empty string to null for bigint column
    const classIdValue = class_id && String(class_id).trim() !== '' ? parseInt(class_id) : null;

    const result = await sql`
      UPDATE sgs_teacher_master SET
        full_name = ${name},
        subject_name = ${subject},
        qualification = ${qualification},
        class_id = ${classIdValue},
        section_1 = ${section_1},
        section_2 = ${section_2},
        role = ${role || 'Teacher'},
        is_class_teacher = ${is_class_teacher || false},
        subjects = ${subjects},
        phone = ${contact},
        email_id = ${email},
        is_active = ${status === 'Active'}
      WHERE teacher_id = ${teacher_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, teacher: result[0] });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_teacher_master SET is_active = false
      WHERE teacher_id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
