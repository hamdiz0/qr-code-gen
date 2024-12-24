import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  const useInternalRoute = process.env.NEXT_PUBLIC_USE_INTERNAL_ROUTE;
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const apiUrl = useInternalRoute
    ? process.env.NEXT_PUBLIC_INTERNAL_API
    : process.env.NEXT_PUBLIC_EXTERNAL_API;

  if (!apiUrl) {
    return NextResponse.json({ error: 'API base URL is not configured' }, { status: 500 });
  }

  try {
    const response = await axios.post(
      `${apiUrl}/generate-qr/?url=${encodeURIComponent(url)}`,
      null,
      { responseType: 'arraybuffer' }
    );

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error generating QR Code:', error);
    return NextResponse.json({ error: 'Failed to generate QR Code' }, { status: 500 });
  }
}