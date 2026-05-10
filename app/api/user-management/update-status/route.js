import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.swais.in' : 'http://localhost:5000');

export async function PUT(request) {
  try {
    const { userIds, newStatus } = await request.json();
    
    if (!userIds || userIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No users selected' }, { status: 400 });
    }
    
    // Forward request to FastAPI backend (auth handled by FastAPI)
    // Get all cookies from the incoming request
    const cookies = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_URL}/admin/users/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
      body: JSON.stringify({ userIds, newStatus }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Backend error' }));
      return NextResponse.json({ success: false, error: error.detail || 'Backend error' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Proxy Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}