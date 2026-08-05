// app/api/notices/route.js

import { NextResponse } from 'next/server';
import { withClient } from '@/lib/db';

// GET - Fetch all notices
export async function GET() {
  try {
    const result = await withClient(async (client) => {
      return await client.query(`
        SELECT 
          id,
          title,
          content,
          created_at
        FROM sgs_notices
        ORDER BY created_at DESC
      `);
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

// POST - Add a new notice
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await withClient(async (client) => {
      return await client.query(
        `INSERT INTO sgs_notices (title, content, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *`,
        [title, content]
      );
    });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding notice:', error);
    return NextResponse.json(
      { error: 'Failed to add notice' },
      { status: 500 }
    );
  }
}

// PUT - Update a notice
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, content } = body;

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title, and content are required' },
        { status: 400 }
      );
    }

    const result = await withClient(async (client) => {
      return await client.query(
        `UPDATE sgs_notices SET
          title = $1,
          content = $2,
          modified_at = NOW()
        WHERE id = $3
        RETURNING *`,
        [title, content, id]
      );
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Notice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      { error: 'Failed to update notice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notice
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

    await withClient(async (client) => {
      return await client.query(
        'DELETE FROM sgs_notices WHERE id = $1',
        [id]
      );
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { error: 'Failed to delete notice' },
      { status: 500 }
    );
  }
}
