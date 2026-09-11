import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const teachers = await sql`
      SELECT 
        teacher_id,
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
      WHERE is_active = true
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
      subjects, contact, email, status
    } = body;

    const isActive = status === 'Active';

    const result = await sql`
      INSERT INTO sgs_teacher_master (
        teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active
      ) VALUES (
        ${teacher_id}, ${name}, ${subject}, ${qualification}, ${class_id},
        ${section_1}, ${section_2}, ${role}, ${is_class_teacher},
        ${subjects}, ${contact}, ${email}, ${isActive}
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
      subjects, contact, email, status
    } = body;

    const isActive = status === 'Active';

    const result = await sql`
      UPDATE sgs_teacher_master SET
        full_name = ${name}, subject_name = ${subject}, 
        qualification = ${qualification}, class_id = ${class_id},
        section_1 = ${section_1}, section_2 = ${section_2},
        role = ${role}, is_class_teacher = ${is_class_teacher},
        subjects = ${subjects}, phone = ${contact}, 
        email_id = ${email}, is_active = ${isActive}
      WHERE teacher_id = ${teacher_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
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
      UPDATE sgs_teacher_master 
      SET is_active = false 
      WHERE teacher_id = ${id}
      RETURNING *
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
