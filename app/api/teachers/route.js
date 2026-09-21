import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

// ---- Helpers -----------------------------------------------------------

/**
 * Convert a subjects input (string OR array) into a clean string[] for Postgres.
 * Accepts: "Math, Science", ["Math", "Science"], null, "", undefined
 * Returns: string[] (never null — Postgres text[] can't take null via this path)
 */
function toSubjectsArray(input) {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  const str = String(input).trim();
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Normalize phone to 10-digit string, or null if invalid.
 * Same rules as lib/validators.js:
 *  - accepts 10 digits starting 6-9
 *  - accepts +91XXXXXXXXXX and 0XXXXXXXXXX
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  const normalized =
    digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  if (!/^[6-9]\d{9}$/.test(normalized)) return null;
  return normalized;
}

/**
 * Convert empty string / undefined / non-numeric to null for bigint columns.
 */
function toBigintOrNull(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return null;
  if (!/^\d+$/.test(str)) return null;
  return parseInt(str, 10);
}

// ---- GET: list all teachers (Active + Inactive) ------------------------

export async function GET() {
  try {
    const teachers = await sql`
      SELECT 
        teacher_id as id,
        full_name as name,
        subject_name as subject,
        qualification,
        class_id,
        section_1,
        section_2,
        role,
        is_class_teacher,
        subjects,
        phone as contact,
        email_id as email,
        is_active,
        CASE WHEN is_active = true THEN 'Active' ELSE 'Inactive' END as status
      FROM sgs_teacher_master
      ORDER BY teacher_id
    `;

    // Normalize subjects array -> comma-joined string for the UI
    const normalized = teachers.map((t) => ({
      ...t,
      subjects: Array.isArray(t.subjects) ? t.subjects.join(', ') : t.subjects || '',
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// ---- POST: create new teacher ------------------------------------------

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      teacher_id, name, subject, qualification, class_id,
      section_1, section_2, role, is_class_teacher,
      subjects, contact, email, status,
    } = body;

    if (!teacher_id || !name || !email) {
      return NextResponse.json(
        { error: 'Teacher ID, Name and Email are required' },
        { status: 400 }
      );
    }

    if (!teacher_id.match(/^[TH]/)) {
      return NextResponse.json(
        { error: 'Teacher ID must start with T or H' },
        { status: 400 }
      );
    }

    // ✅ FIX 14: validate phone if provided
    const normalizedPhone = normalizePhone(contact);
    if (contact && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // ✅ FIX 15: validate class if provided
    const classIdValue = toBigintOrNull(class_id);
    if (classIdValue !== null) {
      const classCheck = await sql`
        SELECT class_id FROM sgs_class_master
        WHERE class_id = ${classIdValue} AND record_status = 'Active'
      `;
      if (classCheck.length === 0) {
        return NextResponse.json(
          { error: `Class ID ${classIdValue} does not exist` },
          { status: 400 }
        );
      }
    }

    // ✅ FIX 13/16: convert subjects to proper string[] for Postgres
    const subjectsArray = toSubjectsArray(subjects);

    const result = await sql`
      INSERT INTO sgs_teacher_master (
        teacher_id, full_name, subject_name, qualification, class_id,
        section_1, section_2, role, is_class_teacher,
        subjects, phone, email_id, is_active
      ) VALUES (
        ${teacher_id}, ${name}, ${subject || null}, ${qualification || null}, ${classIdValue},
        ${section_1 || null}, ${section_2 || null}, ${role || 'Teacher'}, ${is_class_teacher || false},
        ${subjectsArray}, ${normalizedPhone}, ${email}, ${status === 'Active'}
      ) RETURNING *
    `;

    return NextResponse.json(
      { success: true, teacher: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ---- PUT: update existing teacher OR toggle status ---------------------

export async function PUT(request) {
  try {
    const body = await request.json();
    const { teacher_id, status } = body;

    if (!teacher_id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // ✅ FIX 17: STATUS-ONLY TOGGLE
    // If the body contains just teacher_id + status, treat as a toggle
    if (status !== undefined && !body.name) {
      const newStatus = status === 'Active';
      const result = await sql`
        UPDATE sgs_teacher_master
        SET is_active = ${newStatus}
        WHERE teacher_id = ${teacher_id}
        RETURNING *
      `;
      if (result.length === 0) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, teacher: result[0] });
    }

    // ---- FULL UPDATE ----
    const {
      name, subject, qualification, class_id,
      section_1, section_2, role, is_class_teacher,
      subjects, contact, email,
    } = body;

    // ✅ FIX 14: validate phone if provided
    const normalizedPhone = normalizePhone(contact);
    if (contact && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    // ✅ FIX 15: validate class if provided
    const classIdValue = toBigintOrNull(class_id);
    if (classIdValue !== null) {
      const classCheck = await sql`
        SELECT class_id FROM sgs_class_master
        WHERE class_id = ${classIdValue} AND record_status = 'Active'
      `;
      if (classCheck.length === 0) {
        return NextResponse.json(
          { error: `Class ID ${classIdValue} does not exist` },
          { status: 400 }
        );
      }
    }

    // ✅ FIX 13/21: convert subjects to proper string[] for Postgres
    const subjectsArray = toSubjectsArray(subjects);

    const result = await sql`
      UPDATE sgs_teacher_master SET
        full_name = ${name},
        subject_name = ${subject || null},
        qualification = ${qualification || null},
        class_id = ${classIdValue},
        section_1 = ${section_1 || null},
        section_2 = ${section_2 || null},
        role = ${role || 'Teacher'},
        is_class_teacher = ${is_class_teacher || false},
        subjects = ${subjectsArray},
        phone = ${normalizedPhone},
        email_id = ${email},
        is_active = ${status === 'Active'}
      WHERE teacher_id = ${teacher_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, teacher: result[0] });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ---- DELETE: soft-delete (set is_active = false) -----------------------

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_teacher_master SET is_active = false
      WHERE teacher_id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}