import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const students = await sql`
      SELECT 
        admission_no,
        full_name,
        class_id,
        section,
        roll_no,
        parent1_name,
        parent1_phone,
        parent1_email,
        parent2_name,
        parent2_phone,
        parent2_email,
        student_phone,
        student_email,
        guardian_name,
        guardian_phone,
        guardian_email,
        record_status
      FROM sgs_student_master
      WHERE record_status = 'Active'
      ORDER BY admission_no
    `;
    return NextResponse.json(students);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      admission_no, full_name, class_id, section, roll_no,
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_phone, student_email,
      guardian_name, guardian_phone, guardian_email
    } = body;

    // Check for duplicate
    const existing = await sql`
      SELECT admission_no FROM sgs_student_master 
      WHERE admission_no = ${admission_no}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Student ID ${admission_no} already exists` },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO sgs_student_master (
        admission_no, full_name, class_id, section, roll_no,
        parent1_name, parent1_phone, parent1_email,
        parent2_name, parent2_phone, parent2_email,
        student_phone, student_email,
        guardian_name, guardian_phone, guardian_email,
        record_status
      ) VALUES (
        ${admission_no}, ${full_name}, ${class_id}, ${section}, ${roll_no},
        ${parent1_name}, ${parent1_phone}, ${parent1_email},
        ${parent2_name}, ${parent2_phone}, ${parent2_email},
        ${student_phone}, ${student_email},
        ${guardian_name}, ${guardian_phone}, ${guardian_email},
        'Active'
      ) RETURNING *
    `;

    return NextResponse.json({ success: true, student: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { admission_no, full_name, class_id, section, roll_no,
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_phone, student_email,
      guardian_name, guardian_phone, guardian_email } = body;

    const result = await sql`
      UPDATE sgs_student_master SET
        full_name = ${full_name}, class_id = ${class_id}, 
        section = ${section}, roll_no = ${roll_no},
        parent1_name = ${parent1_name}, parent1_phone = ${parent1_phone}, 
        parent1_email = ${parent1_email},
        parent2_name = ${parent2_name}, parent2_phone = ${parent2_phone}, 
        parent2_email = ${parent2_email},
        student_phone = ${student_phone}, student_email = ${student_email},
        guardian_name = ${guardian_name}, guardian_phone = ${guardian_phone}, 
        guardian_email = ${guardian_email}
      WHERE admission_no = ${admission_no}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: result[0] });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_student_master 
      SET record_status = 'Deleted' 
      WHERE admission_no = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
