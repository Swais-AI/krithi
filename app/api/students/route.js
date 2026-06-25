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
    const result = await pool.query(`
      SELECT 
        student_id as id,
        admission_no as student_id,
        full_name as name,
        class_name as class,
        section as section,
        guardian_name as parentname,
        student_phone as contact,
        student_email as email,
        record_status as status
      FROM sgs_student_master
      WHERE record_status != 'Deleted'
      ORDER BY student_id
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { student_id, name, class: className, section, parentname, contact, email, status } = body;
    
    const result = await pool.query(
      `INSERT INTO sgs_student_master 
       (admission_no, full_name, class_name, section, guardian_name, student_phone, student_email, record_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [student_id, name, className, section, parentname, contact, email, status || 'Active']
    );
    
    return NextResponse.json({ 
      success: true,
      student: {
        id: result.rows[0].student_id,
        student_id: result.rows[0].admission_no,
        name: result.rows[0].full_name,
        class: result.rows[0].class_name,
        section: result.rows[0].section,
        parentname: result.rows[0].guardian_name,
        contact: result.rows[0].student_phone,
        email: result.rows[0].student_email,
        status: result.rows[0].record_status
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, student_id, name, class: className, section, parentname, contact, email, status } = body;
    
    await pool.query(
      `UPDATE sgs_student_master 
       SET full_name = $1, class_name = $2, section = $3, guardian_name = $4, student_phone = $5, student_email = $6, record_status = $7
       WHERE admission_no = $8`,
      [name, className, section, parentname, contact, email, status, student_id]
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
    
    await pool.query(
      `UPDATE sgs_student_master SET record_status = 'Deleted' WHERE admission_no = $1`,
      [id]
    );
    
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
