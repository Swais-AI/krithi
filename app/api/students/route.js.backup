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
        sm.student_id as id,
        sm.admission_no,
        sm.full_name as name,
        COALESCE(cm.class_name || '-' || cm.section_name, 'N/A') as class,
        sm.section,
        sm.roll_no,
        sm.parent1_name,
        sm.parent1_phone,
        sm.parent1_email,
        sm.parent2_name,
        sm.parent2_phone,
        sm.parent2_email,
        sm.student_phone as student_contact,
        sm.student_email,
        sm.guardian_name,
        sm.guardian_phone,
        sm.guardian_email,
        sm.record_status as status
      FROM sgs_student_master sm
      LEFT JOIN sgs_class_master cm ON sm.class_id = cm.class_id
      WHERE sm.record_status != 'Deleted'
      ORDER BY sm.student_id
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
      admission_no, name, class: className, section, roll_no,
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_contact, student_email,
      guardian_name, guardian_phone, guardian_email,
      status
    } = body;
    
    let classResult = await pool.query(
      `SELECT class_id FROM sgs_class_master WHERE class_name = $1 AND section_name = $2`,
      [className, section]
    );
    
    let class_id;
    if (classResult.rows.length === 0) {
      const newClass = await pool.query(
        `INSERT INTO sgs_class_master (class_name, section_name, record_status) 
         VALUES ($1, $2, 'Active') RETURNING class_id`,
        [className, section]
      );
      class_id = newClass.rows[0].class_id;
    } else {
      class_id = classResult.rows[0].class_id;
    }
    
    const result = await pool.query(
      `INSERT INTO sgs_student_master 
       (admission_no, full_name, class_id, section, roll_no,
        parent1_name, parent1_phone, parent1_email,
        parent2_name, parent2_phone, parent2_email,
        student_phone, student_email, guardian_name, guardian_phone, guardian_email,
        record_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [admission_no, name, class_id, section, roll_no,
       parent1_name, parent1_phone, parent1_email,
       parent2_name, parent2_phone, parent2_email,
       student_contact, student_email, guardian_name, guardian_phone, guardian_email,
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
      parent1_name, parent1_phone, parent1_email,
      parent2_name, parent2_phone, parent2_email,
      student_contact, student_email,
      guardian_name, guardian_phone, guardian_email,
      status, id
    } = body;
    
    let classResult = await pool.query(
      `SELECT class_id FROM sgs_class_master WHERE class_name = $1 AND section_name = $2`,
      [className, section]
    );
    
    let class_id;
    if (classResult.rows.length === 0) {
      const newClass = await pool.query(
        `INSERT INTO sgs_class_master (class_name, section_name, record_status) 
         VALUES ($1, $2, 'Active') RETURNING class_id`,
        [className, section]
      );
      class_id = newClass.rows[0].class_id;
    } else {
      class_id = classResult.rows[0].class_id;
    }
    
    await pool.query(
      `UPDATE sgs_student_master 
       SET full_name = $1, class_id = $2, section = $3, roll_no = $4,
           parent1_name = $5, parent1_phone = $6, parent1_email = $7,
           parent2_name = $8, parent2_phone = $9, parent2_email = $10,
           student_phone = $11, student_email = $12,
           guardian_name = $13, guardian_phone = $14, guardian_email = $15,
           record_status = $16
       WHERE admission_no = $17 OR student_id = $18`,
      [name, class_id, section, roll_no,
       parent1_name, parent1_phone, parent1_email,
       parent2_name, parent2_phone, parent2_email,
       student_contact, student_email,
       guardian_name, guardian_phone, guardian_email,
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
    
    await pool.query(
      `UPDATE sgs_student_master SET record_status = 'Deleted' WHERE admission_no = $1 OR student_id = $1`,
      [id]
    );
    
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
