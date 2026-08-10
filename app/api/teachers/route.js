import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

export async function GET() {
  try {
    console.log('🔍 Fetching teachers from SGS database...');
    
    // Check if sgs_teacher_master exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sgs_teacher_master'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ sgs_teacher_master table not found');
      return NextResponse.json([], { status: 200 });
    }
    
    // Get column names
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_teacher_master'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);
    console.log('📋 Available columns:', existingColumns);

    // Build query based on available columns
    let query = `
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
      WHERE is_active = true
      ORDER BY teacher_id
    `;

    console.log('📝 Executing query:', query);
    const result = await pool.query(query);
    console.log(`✅ Found ${result.rows.length} teachers`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📝 Received teacher data:', body);

    const {
      teacher_id,
      name,
      subject,
      qualification,
      class_id,
      section_1,
      section_2,
      role,
      is_class_teacher,
      subjects,
      contact,
      email,
      status
    } = body;

    // Validate required fields
    if (!teacher_id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Teacher Name is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate Teacher ID prefix
    if (!teacher_id.match(/^[TH]/)) {
      return NextResponse.json(
        { error: 'Teacher ID must start with "T" (Teacher) or "H" (Headmaster)' },
        { status: 400 }
      );
    }

    // Check for duplicate teacher_id
    const checkDuplicate = await pool.query(
      'SELECT teacher_id FROM sgs_teacher_master WHERE teacher_id = $1',
      [teacher_id]
    );

    if (checkDuplicate.rows.length > 0) {
      return NextResponse.json(
        { error: `Teacher ID ${teacher_id} already exists` },
        { status: 400 }
      );
    }

    const isActive = status === 'Active';

    const result = await pool.query(
      `INSERT INTO sgs_teacher_master (
        teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        teacher_id, name, subject || null, qualification || null,
        class_id || null, section_1 || null, section_2 || null,
        role || 'Teacher', is_class_teacher || false,
        subjects || null, contact || null, email, isActive
      ]
    );

    return NextResponse.json({
      success: true,
      teacher: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error adding teacher:', error);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('📝 Updating teacher:', body);

    const {
      teacher_id,
      name,
      subject,
      qualification,
      class_id,
      section_1,
      section_2,
      role,
      is_class_teacher,
      subjects,
      contact,
      email,
      status
    } = body;

    if (!teacher_id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const checkExists = await pool.query(
      'SELECT teacher_id FROM sgs_teacher_master WHERE teacher_id = $1',
      [teacher_id]
    );

    if (checkExists.rows.length === 0) {
      return NextResponse.json(
        { error: `Teacher with ID ${teacher_id} not found` },
        { status: 404 }
      );
    }

    const isActive = status === 'Active';

    const result = await pool.query(
      `UPDATE sgs_teacher_master SET
        full_name = $1, subject_name = $2, qualification = $3,
        class_id = $4, section_1 = $5, section_2 = $6,
        role = $7, is_class_teacher = $8, subjects = $9,
        phone = $10, email_id = $11, is_active = $12
      WHERE teacher_id = $13
      RETURNING *`,
      [
        name, subject || null, qualification || null,
        class_id || null, section_1 || null, section_2 || null,
        role || 'Teacher', is_class_teacher || false,
        subjects || null, contact || null, email, isActive,
        teacher_id
      ]
    );

    return NextResponse.json({
      success: true,
      teacher: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating teacher:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

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

    const result = await pool.query(
      `UPDATE sgs_teacher_master SET is_active = false WHERE teacher_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: `Teacher with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting teacher:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
