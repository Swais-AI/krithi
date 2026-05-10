import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || (process.env.NODE_ENV === 'production' ? 'https://api.swais.in' : 'http://localhost:5000');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    // Forward request to FastAPI backend (auth handled by FastAPI)
    const backendUrl = new URL('/admin/users', BACKEND_URL);
    if (search) backendUrl.searchParams.set('search', search);
    if (status) backendUrl.searchParams.set('status', status);
    
    // Get all cookies from the incoming request
    const cookies = request.headers.get('cookie') || '';
    
    const response = await fetch(backendUrl.toString(), {
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