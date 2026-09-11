import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

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
    console.log('📝 Received student data:', body);

    const {
      admission_no, full_name, class_id, section, roll_no,
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_phone, student_email,
      guardian_name, guardian_phone, guardian_email
    } = body;

    // Validate required fields
    if (!admission_no || !full_name || !class_id || !section) {
      return NextResponse.json(
        { error: 'Student ID, Name, Class and Section are required' },
        { status: 400 }
      );
    }

    // ✅ CRITICAL FIX: Check if class_id exists in sgs_class_master BEFORE inserting
    const classCheck = await sql`
      SELECT class_id, class_name 
      FROM sgs_class_master 
      WHERE class_id = ${class_id} 
      AND record_status = 'Active'
    `;

    if (classCheck.length === 0) {
      // Get available classes to show the user
      const allClasses = await sql`
        SELECT class_id, class_name 
        FROM sgs_class_master 
        WHERE record_status = 'Active'
        ORDER BY class_id
      `;
      
      const classList = allClasses.map(c => `${c.class_id} (${c.class_name})`).join(', ');
      
      return NextResponse.json(
        { 
          error: `Class ID "${class_id}" does not exist. Available classes: ${classList}`,
          available_classes: allClasses
        },
        { status: 400 }
      );
    }

    // Check for duplicate admission number
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
    
    // Better error handling for FK violations
    if (error.message && error.message.includes('foreign key')) {
      return NextResponse.json({
        error: 'The selected class is not valid. Please choose a class from the dropdown.',
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('📝 Updating student:', body);

    const {
      admission_no, full_name, class_id, section, roll_no,
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_phone, student_email,
      guardian_name, guardian_phone, guardian_email
    } = body;

    if (!admission_no) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // ✅ FIX: If class_id is provided, validate it exists
    if (class_id) {
      const classCheck = await sql`
        SELECT class_id FROM sgs_class_master 
        WHERE class_id = ${class_id} 
        AND record_status = 'Active'
      `;
      
      if (classCheck.length === 0) {
        const allClasses = await sql`
          SELECT class_id, class_name 
          FROM sgs_class_master 
          WHERE record_status = 'Active'
        `;
        const classList = allClasses.map(c => `${c.class_id} (${c.class_name})`).join(', ');
        
        return NextResponse.json(
          { error: `Class ID "${class_id}" does not exist. Available: ${classList}` },
          { status: 400 }
        );
      }
    }

    // ✅ FIX: Build update query dynamically to handle null values
    const result = await sql`
      UPDATE sgs_student_master SET
        full_name = ${full_name},
        class_id = ${class_id || null},
        section = ${section || null},
        roll_no = ${roll_no || null},
        parent1_name = ${parent1_name || null},
        parent1_phone = ${parent1_phone || null},
        parent1_email = ${parent1_email || null},
        parent2_name = ${parent2_name || null},
        parent2_phone = ${parent2_phone || null},
        parent2_email = ${parent2_email || null},
        student_phone = ${student_phone || null},
        student_email = ${student_email || null},
        guardian_name = ${guardian_name || null},
        guardian_phone = ${guardian_phone || null},
        guardian_email = ${guardian_email || null}
      WHERE admission_no = ${admission_no}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: result[0] });
  } catch (error) {
    console.error('Error updating student:', error);
    
    if (error.message && error.message.includes('foreign key')) {
      return NextResponse.json({
        error: 'The selected class is not valid. Please choose a class from the dropdown.'
      }, { status: 400 });
    }
    
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
