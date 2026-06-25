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
        CASE WHEN is_active = true THEN 'Active' ELSE 'Inactive' END as status
      FROM sgs_teacher_master
      WHERE is_active = true
      ORDER BY teacher_id
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
    const { 
      teacher_id, name, subject, qualification, class_id,
      section_1, section_2, role, is_class_teacher,
      subjects, contact, email, status
    } = body;
    
    const isActive = status === 'Active';
    
    const result = await pool.query(
      `INSERT INTO sgs_teacher_master 
       (teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [teacher_id, name, subject, qualification, class_id,
       section_1, section_2, role, is_class_teacher,
       subjects, contact, email, isActive]
    );
    
    return NextResponse.json({ 
      success: true,
      teacher: result.rows[0]
    }, { status: 201 });
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
    
    await pool.query(
      `UPDATE sgs_teacher_master 
       SET full_name = $1, subject_name = $2, qualification = $3,
           class_id = $4, section_1 = $5, section_2 = $6,
           role = $7, is_class_teacher = $8, subjects = $9,
           phone = $10, email_id = $11, is_active = $12
       WHERE teacher_id = $13`,
      [name, subject, qualification, class_id,
       section_1, section_2, role, is_class_teacher,
       subjects, contact, email, isActive, teacher_id]
    );
    
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
    
    await pool.query(
      `UPDATE sgs_teacher_master SET is_active = false WHERE teacher_id = $1`,
      [id]
    );
    
    return NextResponse.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
