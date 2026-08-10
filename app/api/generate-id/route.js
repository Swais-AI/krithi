import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'student';
    
    let prefix = 'S';
    let tableName = 'sgs_student_master';
    let idColumn = 'admission_no';
    
    if (type === 'teacher') {
      prefix = 'T';
      tableName = 'sgs_teacher_master';
      idColumn = 'teacher_id';
    } else if (type === 'headmaster') {
      prefix = 'H';
      tableName = 'sgs_teacher_master';
      idColumn = 'teacher_id';
    }
    
    console.log(`🔍 Generating ${type} ID...`);
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [tableName]);
    
    if (!tableCheck.rows[0].exists) {
      console.log(`❌ Table ${tableName} not found, using fallback`);
      const fallbackId = `${prefix}001`;
      return NextResponse.json({ id: fallbackId });
    }
    
    // Get the highest ID
    const result = await pool.query(
      `SELECT ${idColumn} FROM ${tableName} WHERE ${idColumn} LIKE $1 ORDER BY ${idColumn} DESC LIMIT 1`,
      [`${prefix}%`]
    );
    
    let nextNumber = 1;
    if (result.rows.length > 0) {
      const lastId = result.rows[0][idColumn];
      console.log(`📝 Last ID: ${lastId}`);
      
      // Extract number from ID (e.g., S305 -> 305)
      const numPart = parseInt(lastId.replace(prefix, ''));
      if (!isNaN(numPart)) {
        nextNumber = numPart + 1;
        console.log(`📊 Next number: ${nextNumber}`);
      }
    }
    
    const newId = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    console.log(`✅ Generated ${type} ID: ${newId}`);
    
    return NextResponse.json({ id: newId });
  } catch (error) {
    console.error('❌ Error generating ID:', error);
    const fallbackId = `S${String(Math.floor(Math.random() * 9000) + 1000)}`;
    return NextResponse.json({ id: fallbackId });
  }
}
