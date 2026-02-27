import { NextResponse } from 'next/server';
import { getTemplates } from '@/lib/templates';

export async function GET() {
  try {
    const templates = getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
