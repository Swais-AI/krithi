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

export async function GET() {
  try {
    console.log('🔍 Fetching notices from SGS database...');
    
    // Check if sgs_notice_board exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sgs_notice_board'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ sgs_notice_board table not found');
      return NextResponse.json([], { status: 200 });
    }
    
    // Get column names
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_notice_board'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);
    console.log('📋 Available columns:', existingColumns);

    // Build query based on available columns
    let selectFields = [];
    const columnMap = {
      'id': ['notice_id', 'id'],
      'title': ['notice_title', 'title'],
      'message': ['notice_text', 'message'],
      'date': ['notice_date', 'date'],
      'applicable_class': ['applicable_class'],
      'status': ['record_status', 'status']
    };

    for (const [key, alternatives] of Object.entries(columnMap)) {
      for (const col of alternatives) {
        if (existingColumns.includes(col)) {
          selectFields.push(`${col} as ${key}`);
          break;
        }
      }
    }

    let query;
    if (selectFields.length === 0) {
      query = `SELECT * FROM sgs_notice_board`;
    } else {
      query = `SELECT ${selectFields.join(', ')} FROM sgs_notice_board`;
      if (existingColumns.includes('record_status')) {
        query += ` WHERE record_status = 'Active'`;
      }
      if (existingColumns.includes('notice_date')) {
        query += ' ORDER BY notice_date DESC';
      }
    }

    console.log('📝 Executing query:', query);
    const result = await pool.query(query);
    console.log(`✅ Found ${result.rows.length} notices`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('❌ Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📝 Received notice data:', body);

    const { title, message, date, applicable_class } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get column names
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_notice_board'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(r => r.column_name);

    // Build insert query based on existing columns
    const insertColumns = [];
    const values = [];

    const fieldMap = {
      'notice_title': title,
      'notice_text': message,
      'notice_date': date || new Date().toISOString().split('T')[0],
      'applicable_class': applicable_class || 'all'
    };

    for (const [column, value] of Object.entries(fieldMap)) {
      if (existingColumns.includes(column)) {
        insertColumns.push(column);
        values.push(value);
      }
    }

    if (existingColumns.includes('record_status')) {
      insertColumns.push('record_status');
      values.push('Active');
    }

    if (insertColumns.length === 0) {
      return NextResponse.json(
        { error: 'No matching columns found in the database' },
        { status: 400 }
      );
    }

    const columnNames = insertColumns.join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO sgs_notice_board (${columnNames}) VALUES (${placeholders}) RETURNING *`;

    console.log('📝 Insert query:', query);
    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      notice: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error adding notice:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Notice ID is required' },
        { status: 400 }
      );
    }

    // Check if notice exists
    const checkExists = await pool.query(
      'SELECT notice_id FROM sgs_notice_board WHERE notice_id = $1',
      [id]
    );

    if (checkExists.rows.length === 0) {
      return NextResponse.json(
        { error: `Notice with ID ${id} not found` },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE sgs_notice_board SET record_status = 'Deleted' WHERE notice_id = $1 RETURNING *`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting notice:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
