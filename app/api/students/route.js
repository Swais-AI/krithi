// app/api/students/route.js

import { NextResponse } from 'next/server';
import { withClient } from '@/lib/db';

// GET - Fetch all students
export async function GET() {
  try {
    const result = await withClient(async (client) => {
      return await client.query(`
        SELECT 
          s.student_id as id,
          s.admission_no,
          s.student_name,
          s.class,
          s.section,
          s.father_name,
          s.mother_name,
          s.mobile_no,
          s.parent_contact,
          s.student_contact,
          s.status,
          s.created_at
        FROM sgs_student_master s
        ORDER BY s.created_at DESC
      `);
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Add a new student
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      admission_no,
      student_name,
      class,
      section,
      father_name,
      mother_name,
      mobile_no,
      parent_contact,
      student_contact
    } = body;

    // Check for duplicate admission number
    const checkDuplicate = await withClient(async (client) => {
      return await client.query(
        'SELECT student_id FROM sgs_student_master WHERE admission_no = $1',
        [admission_no]
      );
    });

    if (checkDuplicate.rows.length > 0) {
      return NextResponse.json(
        { error: 'Admission number already exists' },
        { status: 400 }
      );
    }

    const result = await withClient(async (client) => {
      return await client.query(
        `INSERT INTO sgs_student_master (
          admission_no, student_name, class, section, 
          father_name, mother_name, mobile_no, parent_contact, student_contact,
          created_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'Active')
        RETURNING *`,
        [admission_no, student_name, class, section, father_name, mother_name, mobile_no, parent_contact, student_contact]
      );
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    );
  }
}

// PUT - Update a student
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Check if student exists
    const checkExists = await withClient(async (client) => {
      return await client.query(
        'SELECT student_id FROM sgs_student_master WHERE student_id = $1',
        [id]
      );
    });

    if (checkExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const {
      admission_no,
      student_name,
      class,
      section,
      father_name,
      mother_name,
      mobile_no,
      parent_contact,
      student_contact
    } = updateData;

    const result = await withClient(async (client) => {
      return await client.query(
        `UPDATE sgs_student_master SET
          admission_no = $1,
          student_name = $2,
          class = $3,
          section = $4,
          father_name = $5,
          mother_name = $6,
          mobile_no = $7,
          parent_contact = $8,
          student_contact = $9,
          modified_at = NOW()
        WHERE student_id = $10
        RETURNING *`,
        [admission_no, student_name, class, section, father_name, mother_name, mobile_no, parent_contact, student_contact, id]
      );
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a student
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    await withClient(async (client) => {
      return await client.query(
        'DELETE FROM sgs_student_master WHERE student_id = $1',
        [id]
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
