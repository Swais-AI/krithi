import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    console.log('Fetching students from database...');
    
    const result = await pool.query(`
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
      WHERE record_status = 'Active' OR record_status IS NULL
      ORDER BY admission_no
    `);
    
    console.log(`Found ${result.rows.length} students`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received student data:', body);
    
    const {
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
      guardian_email
    } = body;

    if (!admission_no) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!full_name) {
      return NextResponse.json(
        { error: 'Student Name is required' },
        { status: 400 }
      );
    }

    if (!class_id) {
      return NextResponse.json(
        { error: 'Class is required' },
        { status: 400 }
      );
    }

    if (!section) {
      return NextResponse.json(
        { error: 'Section is required' },
        { status: 400 }
      );
    }

    if (!admission_no.match(/^S/)) {
      return NextResponse.json(
        { error: 'Student ID must start with "S"' },
        { status: 400 }
      );
    }

    const checkDuplicate = await pool.query(
      'SELECT admission_no FROM sgs_student_master WHERE admission_no = $1',
      [admission_no]
    );

    if (checkDuplicate.rows.length > 0) {
      return NextResponse.json(
        { error: `Student ID ${admission_no} already exists` },
        { status: 400 }
      );
    }

    let classIdValue = null;
    if (class_id && class_id !== 'null' && class_id !== '') {
      const parsedId = parseInt(class_id);
      if (!isNaN(parsedId)) {
        classIdValue = parsedId;
      }
    }

    const result = await pool.query(
      `INSERT INTO sgs_student_master (
        admission_no, full_name, class_id, section, roll_no,
        parent1_name, parent1_phone, parent1_email,
        parent2_name, parent2_phone, parent2_email,
        student_phone, student_email,
        guardian_name, guardian_phone, guardian_email,
        record_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'Active')
      RETURNING *`,
      [
        admission_no, 
        full_name, 
        classIdValue, 
        section, 
        roll_no || null,
        parent1_name, 
        parent1_phone || null, 
        parent1_email || null,
        parent2_name || null, 
        parent2_phone || null, 
        parent2_email || null,
        student_phone || null, 
        student_email || null,
        guardian_name || null, 
        guardian_phone || null, 
        guardian_email || null
      ]
    );

    return NextResponse.json({
      success: true,
      student: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Updating student:', body);
    
    const {
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
      guardian_email
    } = body;

    if (!admission_no) {
      return NextResponse.json(
        { error: 'Student ID is required for update' },
        { status: 400 }
      );
    }

    const checkExists = await pool.query(
      'SELECT admission_no FROM sgs_student_master WHERE admission_no = $1',
      [admission_no]
    );

    if (checkExists.rows.length === 0) {
      return NextResponse.json(
        { error: `Student with ID ${admission_no} not found` },
        { status: 404 }
      );
    }

    let classIdValue = null;
    if (class_id && class_id !== 'null' && class_id !== '') {
      const parsedId = parseInt(class_id);
      if (!isNaN(parsedId)) {
        classIdValue = parsedId;
      }
    }

    await pool.query(
      `UPDATE sgs_student_master SET
        full_name = $1, 
        class_id = $2, 
        section = $3, 
        roll_no = $4,
        parent1_name = $5, 
        parent1_phone = $6, 
        parent1_email = $7,
        parent2_name = $8, 
        parent2_phone = $9, 
        parent2_email = $10,
        student_phone = $11, 
        student_email = $12,
        guardian_name = $13, 
        guardian_phone = $14, 
        guardian_email = $15
      WHERE admission_no = $16`,
      [
        full_name, 
        classIdValue, 
        section, 
        roll_no || null,
        parent1_name, 
        parent1_phone || null, 
        parent1_email || null,
        parent2_name || null, 
        parent2_phone || null, 
        parent2_email || null,
        student_phone || null, 
        student_email || null,
        guardian_name || null, 
        guardian_phone || null, 
        guardian_email || null,
        admission_no
      ]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Student updated successfully' 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const checkExists = await pool.query(
      'SELECT admission_no FROM sgs_student_master WHERE admission_no = $1',
      [id]
    );

    if (checkExists.rows.length === 0) {
      return NextResponse.json(
        { error: `Student with ID ${id} not found` },
        { status: 404 }
      );
    }

    await pool.query(
      `UPDATE sgs_student_master SET record_status = 'Deleted' WHERE admission_no = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
