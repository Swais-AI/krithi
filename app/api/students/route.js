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
    console.log('🔍 Fetching students from SGS database...');
    
    // Check if sgs_student_master exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sgs_student_master'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ sgs_student_master table not found');
      return NextResponse.json([], { status: 200 });
    }
    
    // Get column names
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_student_master'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);
    console.log('📋 Available columns:', existingColumns);

    // Map SGS columns to expected fields
    let selectFields = [];
    const columnMap = {
      'admission_no': ['admission_no'],
      'full_name': ['full_name'],
      'class_id': ['class_id'],
      'section': ['section'],
      'roll_no': ['roll_no'],
      'parent1_name': ['parent1_name'],
      'parent1_phone': ['parent1_phone'],
      'parent1_email': ['parent1_email'],
      'parent2_name': ['parent2_name'],
      'parent2_phone': ['parent2_phone'],
      'parent2_email': ['parent2_email'],
      'student_phone': ['student_phone'],
      'student_email': ['student_email'],
      'guardian_name': ['guardian_name'],
      'guardian_phone': ['guardian_phone'],
      'guardian_email': ['guardian_email'],
      'record_status': ['record_status']
    };

    for (const [asField, possibleColumns] of Object.entries(columnMap)) {
      for (const col of possibleColumns) {
        if (existingColumns.includes(col)) {
          selectFields.push(`${col} as ${asField}`);
          break;
        }
      }
    }

    let query;
    if (selectFields.length === 0) {
      query = `SELECT * FROM sgs_student_master`;
    } else {
      query = `SELECT ${selectFields.join(', ')} FROM sgs_student_master`;
      if (existingColumns.includes('record_status')) {
        query += ` WHERE record_status = 'Active'`;
      }
      if (existingColumns.includes('admission_no')) {
        query += ' ORDER BY admission_no';
      }
    }

    console.log('📝 Executing query:', query);
    const result = await pool.query(query);
    console.log(`✅ Found ${result.rows.length} students`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Database error:', error);
    // Return empty array with 200 status to prevent UI breaking
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📝 Received student data:', body);

    const {
      admission_no,
      full_name,
      class_id: className,
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

    // Validate required fields
    if (!admission_no) {
      return NextResponse.json(
        { error: 'Admission Number is required' },
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

    // Check for duplicate admission number
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

    const result = await withClient(async (client) => {
      return await client.query(
        `INSERT INTO sgs_student_master (
          admission_no,
          student_name,
          class,
          section,
          father_name,
          mother_name,
          mobile_no,
          parent_contact,
          student_contact,
          created_at,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'Active')
        RETURNING *`,
        [
          admission_no,
          student_name,
          className,
          section,
          father_name,
          mother_name,
          mobile_no,
          parent_contact,
          student_contact
        ]
      );
    });

    return NextResponse.json({
      success: true,
      student: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error adding student:', error);
    return NextResponse.json({
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('📝 Updating student:', body);

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

    // Check if student exists
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

    const {
      admission_no,
      student_name,
      class: className,
      section,
      father_name,
      mother_name,
      mobile_no,
      parent_contact,
      student_contact
    } = updateData;

    const result = await withClient(async (client) => {
      return await client.query(
        `UPDATE sgs_student_master SET
          admission_no = $1,
          student_name = $2,
          class = $3,
          section = $4,
          father_name = $5,
          mother_name = $6,
          mobile_no = $7,
          parent_contact = $8,
          student_contact = $9,
          modified_at = NOW()
        WHERE student_id = $10
        RETURNING *`,
        [
          admission_no,
          student_name,
          className,
          section,
          father_name,
          mother_name,
          mobile_no,
          parent_contact,
          student_contact,
          id
        ]
      );
    });

    return NextResponse.json({
      success: true,
      student: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating student:', error);
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
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE sgs_student_master SET record_status = 'Deleted' WHERE admission_no = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: `Student with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
