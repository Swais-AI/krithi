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
    console.log('Received body:', body); // Debug log
    
    // Support both field naming conventions (from form and from API)
    const teacher_id = body.teacher_id;
    const name = body.teacher_name || body.name; // Support both
    const subject = body.subject || null;
    const qualification = body.qualification || null;
    const class_id = body.class_id; // Keep as is, will handle below
    const section_1 = body.section_1 || null;
    const section_2 = body.section_2 || null;
    const role = body.role || null;
    const is_class_teacher = body.is_class_teacher || false;
    const subjects = body.subjects || null;
    const contact = body.contact_number || body.contact || null; // Support both
    const email = body.email;
    const status = body.status || 'Active';
    
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
    
    // Validate Teacher ID prefix (T=Teacher, H=Headmaster)
    if (!teacher_id.match(/^[TH]/)) {
      return NextResponse.json(
        { error: 'Teacher ID must start with "T" (Teacher) or "H" (Headmaster)' },
        { status: 400 }
      );
    }
    
    // Determine role based on ID prefix
    const determinedRole = teacher_id.startsWith('H') ? 'Headmaster' : 'Teacher';
    
    const isActive = status === 'Active';
    
    // CRITICAL FIX: Handle class_id properly - convert empty string or invalid to null
    let classIdValue = null;
    if (class_id && class_id !== '' && class_id !== 'All' && class_id !== 'ALL') {
      const parsed = parseInt(class_id);
      if (!isNaN(parsed)) {
        classIdValue = parsed;
      }
    }
    
    console.log('Processed class_id:', class_id, '->', classIdValue); // Debug log
    
    // Convert "All" to NULL for sections
    const section1Value = (section_1 === 'All' || section_1 === 'ALL' || section_1 === '') ? null : section_1;
    const section2Value = (section_2 === 'All' || section_2 === 'ALL' || section_2 === '') ? null : section_2;
    
    // Process subjects (handle both string and array)
    let subjectsArray = null;
    if (subjects) {
      if (Array.isArray(subjects)) {
        subjectsArray = subjects;
      } else if (typeof subjects === 'string') {
        subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    const result = await pool.query(
      `INSERT INTO sgs_teacher_master 
       (teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [teacher_id, name, subject, qualification, classIdValue,
       section1Value, section2Value, determinedRole, is_class_teacher,
       subjectsArray, contact, email, isActive]
    );
    
    return NextResponse.json({ 
      success: true,
      teacher: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Update body:', body); // Debug log
    
    const teacher_id = body.teacher_id;
    const name = body.teacher_name || body.name;
    const subject = body.subject || null;
    const qualification = body.qualification || null;
    const class_id = body.class_id;
    const section_1 = body.section_1 || null;
    const section_2 = body.section_2 || null;
    const role = body.role || null;
    const is_class_teacher = body.is_class_teacher || false;
    const subjects = body.subjects || null;
    const contact = body.contact_number || body.contact || null;
    const email = body.email;
    const status = body.status || 'Active';
    
    const isActive = status === 'Active';
    
    // CRITICAL FIX: Handle class_id properly
    let classIdValue = null;
    if (class_id && class_id !== '' && class_id !== 'All' && class_id !== 'ALL') {
      const parsed = parseInt(class_id);
      if (!isNaN(parsed)) {
        classIdValue = parsed;
      }
    }
    
    const section1Value = (section_1 === 'All' || section_1 === 'ALL' || section_1 === '') ? null : section_1;
    const section2Value = (section_2 === 'All' || section_2 === 'ALL' || section_2 === '') ? null : section_2;
    
    // Process subjects
    let subjectsArray = null;
    if (subjects) {
      if (Array.isArray(subjects)) {
        subjectsArray = subjects;
      } else if (typeof subjects === 'string') {
        subjectsArray = subjects.split(',').map(s => s.trim()).filter(s => s);
      }
    }
    
    await pool.query(
      `UPDATE sgs_teacher_master 
       SET full_name = $1, subject_name = $2, qualification = $3,
           class_id = $4, section_1 = $5, section_2 = $6,
           role = $7, is_class_teacher = $8, subjects = $9,
           phone = $10, email_id = $11, is_active = $12
       WHERE teacher_id = $13`,
      [name, subject, qualification, classIdValue,
       section1Value, section2Value, role || 'Teacher', is_class_teacher,
       subjectsArray, contact, email, isActive, teacher_id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating teacher:', error);
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
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }
    
    await pool.query(
      `UPDATE sgs_teacher_master SET is_active = false WHERE teacher_id = $1`,
      [id]
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Teacher deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
