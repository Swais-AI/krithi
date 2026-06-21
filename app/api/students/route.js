import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

const sql = postgres(process.env.DATABASE_URL, { 
  ssl: 'require'
});

// Email validation - must end with @gmail.com
const validateEmail = (email) => {
  if (!email || email.trim() === '') return null;
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.endsWith('@gmail.com')) {
    return trimmedEmail;
  }
  return null;
};

export async function GET(request) {
  try {
    const students = await sql`
      SELECT 
        student_id as id,
        admission_no as admissionNo,
        full_name as name,
        class as class,
        section as section,
        roll_no as rollNo,
        parent1_name as parentName,
        parent1_phone as parentPhone,
        parent1_email as parentEmail,
        student_phone as contact,
        student_email as email,
        guardian_name as guardianName,
        guardian_phone as guardianPhone,
        CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END as status
      FROM sgs_student_master
      WHERE record_status = 'Active' OR record_status IS NULL
      ORDER BY student_id DESC
      LIMIT 100
    `;
    
    console.log('Returning', students.length, 'students');
    return NextResponse.json({ success: true, students: students });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      admissionNo, name, class: className, section, rollNo,
      parentName, parentPhone, parentEmail,
      contact, email, guardianName, guardianPhone, status
    } = body;
    
    const isActive = status === 'active';
    const validEmail = validateEmail(email);
    const validParentEmail = validateEmail(parentEmail);
    
    const result = await sql`
      INSERT INTO sgs_student_master (
        admission_no,
        full_name,
        class,
        section,
        roll_no,
        parent1_name,
        parent1_phone,
        parent1_email,
        student_phone,
        student_email,
        guardian_name,
        guardian_phone,
        is_active,
        created_datetime,
        record_status
      )
      VALUES (
        ${admissionNo || null},
        ${name}, 
        ${className || null},
        ${section || null},
        ${rollNo || null},
        ${parentName || null},
        ${parentPhone || null},
        ${validParentEmail},
        ${contact || null}, 
        ${validEmail},
        ${guardianName || null},
        ${guardianPhone || null},
        ${isActive},
        NOW(),
        'Active'
      )
      RETURNING student_id as id
    `;
    
    return NextResponse.json({ success: true, message: 'Student added successfully', student: result[0] });
  } catch (error) {
    console.error('Error inserting student:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
