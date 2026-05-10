import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.swais.in' : 'http://localhost:5000');

export async function GET(request) {
  try {
    // Forward request to FastAPI backend (auth handled by FastAPI)
    // Get all cookies from the incoming request
    const cookies = request.headers.get('cookie') || '';
    
    const response = await fetch(`${BACKEND_URL}/admin/users/stats`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
      },
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