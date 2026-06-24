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
        sm.admission_no as id,
        sm.admission_no as student_id,
        sm.full_name as name,
        COALESCE(cm.class_name || '-' || cm.section_name, 'N/A') as class,
        sm.guardian_name as parentname,
        sm.student_phone as contact,
        sm.student_email as email,
        sm.record_status as status
      FROM sgs_student_master sm
      LEFT JOIN sgs_class_master cm ON sm.class_id = cm.class_id
      WHERE sm.record_status = 'Active'
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
    const { student_id, name, class: className, parentname, contact, email, status } = body;
    
    const [class_name, section_name] = className.split('-');
    
    let classResult = await pool.query(
      `SELECT class_id FROM sgs_class_master WHERE class_name = $1 AND section_name = $2 AND record_status = 'Active'`,
      [class_name, section_name]
    );
    
    let class_id;
    if (classResult.rows.length === 0) {
      const newClass = await pool.query(
        `INSERT INTO sgs_class_master (class_name, section_name, record_status) 
         VALUES ($1, $2, 'Active') RETURNING class_id`,
        [class_name, section_name]
      );
      class_id = newClass.rows[0].class_id;
    } else {
      class_id = classResult.rows[0].class_id;
    }
    
    await pool.query(
      `INSERT INTO sgs_student_master 
       (admission_no, full_name, class_id, guardian_name, student_phone, student_email, record_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [student_id, name, class_id, parentname, contact, email, status || 'Active']
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
