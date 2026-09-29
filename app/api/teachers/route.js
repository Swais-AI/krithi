import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

// ---- Helpers -----------------------------------------------------------

function toSubjectsArray(input) {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  const str = String(input).trim();
  if (!str) return [];
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

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

function toBigintOrNull(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return null;
  if (!/^\d+$/.test(str)) return null;
  return parseInt(str, 10);
}

/**
 * Convert a Postgres error to a user-friendly message.
 * Never leak raw error.message to the client.
 */
function friendlyDbError(error) {
  const msg = String(error?.message || '');
  const code = error?.code;

  if (code === '23505' || /duplicate key/i.test(msg)) {
    if (msg.includes('teacher_master_email_id_key')) return 'This email is already registered to another teacher. Please use a different email address.';
    if (msg.includes('teacher_master_pkey')) return 'A teacher with this ID already exists.';
    return 'A duplicate record was detected. Please check the values and try again.';
  }

  if (code === '23514' || /violates check constraint/i.test(msg)) {
    return 'One of the values does not meet the required format.';
  }

  if (code === '23503' || /foreign key/i.test(msg)) {
    if (msg.includes('class_id')) return 'The selected class does not exist.';
    return 'A referenced record does not exist.';
  }

  return 'Something went wrong while saving. Please try again or contact support.';
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
      WHERE record_status IS DISTINCT FROM 'Deleted'
      ORDER BY teacher_id
    `;

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

    // Duplicate teacher_id check
    const dupeId = await sql`
      SELECT teacher_id FROM sgs_teacher_master WHERE teacher_id = ${teacher_id}
    `;
    if (dupeId.length > 0) {
      return NextResponse.json(
        { error: `Teacher ID ${teacher_id} already exists. Please use a different ID.` },
        { status: 400 }
      );
    }

    // ✅ FIX #5: Duplicate email check (case-insensitive)
    if (email && String(email).trim()) {
      const dupeEmail = await sql`
        SELECT teacher_id, full_name
        FROM sgs_teacher_master
        WHERE LOWER(email_id) = LOWER(${String(email).trim()})
        LIMIT 1
      `;
      if (dupeEmail.length > 0) {
        return NextResponse.json(
          { error: `This email is already registered to teacher ${dupeEmail[0].teacher_id}${dupeEmail[0].full_name ? ` (${dupeEmail[0].full_name})` : ''}. Please use a different email address.` },
          { status: 400 }
        );
      }
    }

    const normalizedPhone = normalizePhone(contact);
    if (contact && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: friendlyDbError(error) },
      { status: 500 }
    );
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

    // STATUS-ONLY TOGGLE
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

    // ✅ FIX #5: Duplicate email check (case-insensitive, exclude self)
    if (email && String(email).trim()) {
      const dupeEmail = await sql`
        SELECT teacher_id, full_name
        FROM sgs_teacher_master
        WHERE LOWER(email_id) = LOWER(${String(email).trim()})
          AND teacher_id != ${teacher_id}
        LIMIT 1
      `;
      if (dupeEmail.length > 0) {
        return NextResponse.json(
          { error: `This email is already registered to teacher ${dupeEmail[0].teacher_id}${dupeEmail[0].full_name ? ` (${dupeEmail[0].full_name})` : ''}. Please use a different email address.` },
          { status: 400 }
        );
      }
    }

    const normalizedPhone = normalizePhone(contact);
    if (contact && !normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: friendlyDbError(error) },
      { status: 500 }
    );
  }
}

// ---- DELETE: soft-delete (set is_active = false) -----------------------

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Soft delete: mark the record deleted as well as inactive. Setting only
    // is_active left record_status untouched, so the row still read as a live
    // record everywhere else and stayed visible in the list.
    const result = await sql`
      UPDATE sgs_teacher_master
      SET is_active = false,
          record_status = 'Deleted'
      WHERE teacher_id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: friendlyDbError(error) },
      { status: 500 }
    );
  }
}