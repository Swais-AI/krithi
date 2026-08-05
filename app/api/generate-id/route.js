// app/api/generate-id/route.js

import { NextResponse } from 'next/server';
import { withClient } from '@/lib/db';

export async function GET() {
  try {
    // Get the next admission number
    const result = await withClient(async (client) => {
      return await client.query(`
        SELECT COALESCE(MAX(CAST(SUBSTRING(admission_no, 6) AS INTEGER)), 0) + 1 as next_id
        FROM sgs_student_master
        WHERE admission_no LIKE '2025-%'
      `);
    });

    const nextId = result.rows[0].next_id || 1;
    const admissionNo = `2025-${String(nextId).padStart(4, '0')}`;

    return NextResponse.json({ admission_no: admissionNo });
  } catch (error) {
    console.error('Error generating ID:', error);
    return NextResponse.json(
      { error: 'Failed to generate ID' },
      { status: 500 }
    );
  }
}
