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
    console.error('Database error:', error);
    // If table doesn't exist, return empty array
    if (error.message && error.message.includes('relation')) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, date, type, applicable_class } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Check if event_type column exists
    const columnsCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sgs_events'
      AND column_name = 'event_type'
    `;

    let result;
    if (columnsCheck.length > 0) {
      // Has event_type column
      result = await sql`
        INSERT INTO sgs_events (
          event_title, event_description, event_date, event_type, applicable_class, record_status
        ) VALUES (
          ${title}, ${message}, ${date || new Date().toISOString().split('T')[0]}, 
          ${type || 'event'}, ${applicable_class || 'all'}, 'Active'
        ) RETURNING *
      `;
    } else {
      // No event_type column
      result = await sql`
        INSERT INTO sgs_events (
          event_title, event_description, event_date, applicable_class, record_status
        ) VALUES (
          ${title}, ${message}, ${date || new Date().toISOString().split('T')[0]}, 
          ${applicable_class || 'all'}, 'Active'
        ) RETURNING *
      `;
    }

    return NextResponse.json({ 
      success: true, 
      event: result[0],
      message: 'Event created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const result = await sql`
      UPDATE sgs_events 
      SET record_status = 'Deleted' 
      WHERE event_id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
