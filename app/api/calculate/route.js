import { analyze_image } from '@/lib/calculator/utils';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image, dict_of_vars } = await request.json();
    
    // Extract base64 image data
    const base64Data = image.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Process image
    const responses = await analyze_image(imageBuffer, dict_of_vars || {});
    
    return NextResponse.json({
      message: "Image processed",
      data: responses,
      status: "success"
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: "Error processing image", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Calculator API is running" });
}