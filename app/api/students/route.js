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
    
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_student_master'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);
    console.log('📋 Available columns:', existingColumns);

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
        class_id, 
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
        { error: 'Student ID is required for update' },
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

    const result = await pool.query(
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
        class_id, 
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
    console.error('❌ Error updating student:', error);
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
