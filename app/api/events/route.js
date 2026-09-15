import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    const events = await sql`
      SELECT 
        event_id as id,
        event_title as title,
        event_description as message,
        event_date as date,
        event_type as type,
        applicable_class,
        record_status as status
      FROM sgs_events
      WHERE record_status = 'Active'
      ORDER BY event_date DESC
    `;
    return NextResponse.json(events);
  } catch (error) {
    // Table may not exist yet — return empty array so UI doesn't break
    if (error.message && error.message.includes('does not exist')) {
      console.warn('sgs_events table does not exist yet');
      return NextResponse.json([], { status: 200 });
    }
    console.error('Database error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, title, message, date, type, applicable_class } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (id) {
      const result = await sql`
        UPDATE sgs_events
        SET
          event_title = ${title},
          event_description = ${message},
          event_date = ${date},
          event_type = ${type || 'event'},
          applicable_class = ${applicable_class || 'all'}
        WHERE event_id = ${id}
        RETURNING *
      `;
      if (result.length === 0) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, event: result[0], message: 'Event updated successfully' });
    }

    const result = await sql`
      INSERT INTO sgs_events (
        event_title, event_description, event_date, event_type, applicable_class, record_status
      ) VALUES (
        ${title}, ${message}, ${date}, ${type || 'event'}, ${applicable_class || 'all'}, 'Active'
      ) RETURNING *
    `;
    return NextResponse.json({ success: true, event: result[0], message: 'Event created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_events SET record_status = 'Deleted'
      WHERE event_id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
