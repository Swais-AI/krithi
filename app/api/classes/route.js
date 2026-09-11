import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const classes = await sql`
      SELECT 
        class_id,
        class_name,
        section_name
      FROM sgs_class_master
      WHERE record_status = 'Active'
      ORDER BY class_id
    `;
    
    console.log('✅ Fetched classes:', classes.length);
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json([], { status: 200 });
  }
}
