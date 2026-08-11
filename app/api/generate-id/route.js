import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
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
    console.log(`📋 Table: ${tableName}, Column: ${idColumn}, Prefix: ${prefix}`);
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      )
    `, [tableName]);
    
    if (!tableCheck.rows[0].exists) {
      console.log(`❌ Table ${tableName} not found`);
      return NextResponse.json({ id: `${prefix}001` });
    }
    
    // Get the highest ID - use a more robust query
    let result;
    try {
      // Try the simple approach first
      result = await pool.query(
        `SELECT ${idColumn} FROM ${tableName} 
         WHERE ${idColumn} LIKE $1 
         AND ${idColumn} ~ '^[A-Z][0-9]+$' 
         ORDER BY ${idColumn} DESC LIMIT 1`,
        [`${prefix}%`]
      );
    } catch (error) {
      console.log('⚠️ Simple query failed, trying alternative...');
      // If regex fails, try a simpler approach
      result = await pool.query(
        `SELECT ${idColumn} FROM ${tableName} 
         WHERE ${idColumn} LIKE $1 
         ORDER BY ${idColumn} DESC LIMIT 1`,
        [`${prefix}%`]
      );
    }
    
    let nextNumber = 1;
    if (result.rows.length > 0) {
      const lastId = result.rows[0][idColumn];
      console.log(`📝 Last ID from DB: ${lastId}`);
      
      // Extract the number part
      const numPart = parseInt(lastId.replace(prefix, ''));
      if (!isNaN(numPart) && numPart > 0) {
        nextNumber = numPart + 1;
        console.log(`📊 Next number: ${nextNumber}`);
      } else {
        console.log(`⚠️ Could not parse number from ${lastId}, starting from 1`);
        nextNumber = 1;
      }
    } else {
      console.log(`📊 No existing IDs found, starting from 1`);
      nextNumber = 1;
    }
    
    const newId = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    console.log(`✅ Generated ${type} ID: ${newId}`);
    
    return NextResponse.json({ id: newId });
  } catch (error) {
    console.error('❌ Error generating ID:', error);
    // Return a simple fallback
    const fallbackId = 'S001';
    console.log(`⚠️ Using fallback ID: ${fallbackId}`);
    return NextResponse.json({ id: fallbackId });
  }
}
