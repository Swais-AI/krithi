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
    // Get stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN record_status = 'Active' THEN 1 END) as active,
        COUNT(CASE WHEN record_status = 'Inactive' THEN 1 END) as inactive
      FROM sgs_student_master
      WHERE record_status IN ('Active', 'Inactive')
    `);
    
    const result = await pool.query(`
      SELECT 
        student_id as id,
        admission_no,
        full_name as name,
        class_name as class,
        section,
        roll_no,
        parent1_name as parent_name,
        parent1_phone as parent_phone,
        parent1_email as parent_email,
        student_phone as student_contact,
        student_email,
        guardian_name,
        guardian_phone,
        record_status as status
      FROM sgs_student_master
      WHERE record_status != 'Deleted'
      ORDER BY student_id
    `);
    
    return NextResponse.json({
      students: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      admission_no, name, class: className, section, roll_no,
      parent_name, parent_phone, parent_email,
      student_contact, student_email,
      guardian_name, guardian_phone,
      status
    } = body;
    
      if (!admission_no || !admission_no.match(/^S/)) {
      return NextResponse.json(
        { error: 'Admission Number must start with "S" (Student)' },
        { status: 400 }
      );
    }
    
    const result = await pool.query(
      `INSERT INTO sgs_student_master 
       (admission_no, full_name, class_name, section, roll_no,
        parent1_name, parent1_phone, parent1_email,
        student_phone, student_email, guardian_name, guardian_phone,
        record_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [admission_no, name, className, section, roll_no,
       parent_name, parent_phone, parent_email,
       student_contact, student_email, guardian_name, guardian_phone,
       status || 'Active']
    );
    
    return NextResponse.json({ 
      success: true,
      student: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      admission_no, name, class: className, section, roll_no,
      parent_name, parent_phone, parent_email,
      student_contact, student_email,
      guardian_name, guardian_phone,
      status, id
    } = body;
    
    await pool.query(
      `UPDATE sgs_student_master 
       SET full_name = $1, class_name = $2, section = $3, roll_no = $4,
           parent1_name = $5, parent1_phone = $6, parent1_email = $7,
           student_phone = $8, student_email = $9,
           guardian_name = $10, guardian_phone = $11,
           record_status = $12
       WHERE admission_no = $13 OR student_id = $14`,
      [name, className, section, roll_no,
       parent_name, parent_phone, parent_email,
       student_contact, student_email,
       guardian_name, guardian_phone,
       status, admission_no, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }
    
    const result = await pool.query(
      `UPDATE sgs_student_master SET record_status = 'Deleted' WHERE admission_no = $1 OR student_id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
   
