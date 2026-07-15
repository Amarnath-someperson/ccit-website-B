import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const blogDir = path.join(process.cwd(), 'public', 'blog');
  const files = fs.readdirSync(blogDir);
  const slugs = files
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
  return NextResponse.json(slugs);
}