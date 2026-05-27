import { NextResponse } from 'next/server';
import { getRandomExcuse } from '@/lib/excuse.service';

export async function GET() {
  const excuse = getRandomExcuse();
  return NextResponse.json(excuse, { status: 200 });
}
