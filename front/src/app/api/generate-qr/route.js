import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Request the QR code image from the external API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/generate-qr/?url=${encodeURIComponent(url)}`,
      null,
      { responseType: 'arraybuffer' } // Ensure we get binary data
    );

    // Create a response with the binary data and the correct content type
    return new NextResponse(response.data, {
      headers: {'Content-Type': 'image/png',},
    });
  } catch (error) {
    console.error('Error generating QR Code:', error);
    return NextResponse.json({ error: 'Failed to generate QR Code' }, { status: 500 });
  }
}