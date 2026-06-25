import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        teacher_id as id,
        teacher_id as teacher_id,
        full_name as name,
        subject_name as subject,
        phone as contact,
        email_id as email,
        qualification,
        is_class_teacher,
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
    const { teacher_id, name, subject, contact, email, qualification, is_class_teacher, status } = body;
    
    const isActive = status === 'Active';
    const isClassTeacher = is_class_teacher === true || is_class_teacher === 'true';
    
    const result = await pool.query(
      `INSERT INTO sgs_teacher_master 
       (teacher_id, full_name, subject_name, phone, email_id, qualification, is_class_teacher, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [teacher_id, name, subject, contact, email, qualification || null, isClassTeacher, isActive]
    );
    
    return NextResponse.json({ 
      success: true,
      teacher: {
        id: result.rows[0].teacher_id,
        name: result.rows[0].full_name,
        subject: result.rows[0].subject_name,
        contact: result.rows[0].phone,
        email: result.rows[0].email_id,
        qualification: result.rows[0].qualification,
        is_class_teacher: result.rows[0].is_class_teacher,
        status: result.rows[0].is_active ? 'Active' : 'Inactive'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { teacher_id, name, subject, contact, email, qualification, is_class_teacher, status } = body;
    
    const isActive = status === 'Active';
    const isClassTeacher = is_class_teacher === true || is_class_teacher === 'true';
    
    await pool.query(
      `UPDATE sgs_teacher_master 
       SET full_name = $1, subject_name = $2, phone = $3, email_id = $4, 
           qualification = $5, is_class_teacher = $6, is_active = $7
       WHERE teacher_id = $8`,
      [name, subject, contact, email, qualification || null, isClassTeacher, isActive, teacher_id]
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
