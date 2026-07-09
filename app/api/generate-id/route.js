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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'student', 'teacher', 'headmaster'
    
    let table, idColumn, prefix;
    
    if (type === 'student') {
      table = 'sgs_student_master';
      idColumn = 'admission_no';
      prefix = 'S';
    } else if (type === 'teacher' || type === 'headmaster') {
      table = 'sgs_teacher_master';
      idColumn = 'teacher_id';
      prefix = type === 'headmaster' ? 'H' : 'T';
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    
    // Get max ID number
    const result = await pool.query(
      `SELECT MAX(CAST(SUBSTRING(${idColumn} FROM 2) AS INTEGER)) as max_num 
       FROM ${table} 
       WHERE ${idColumn} ~ '^${prefix}[0-9]+$'`
    );
    
    const maxNum = result.rows[0].max_num || 0;
    const nextNum = maxNum + 1;
    const nextId = `${prefix}${nextNum}`;
    
    return NextResponse.json({ id: nextId });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
