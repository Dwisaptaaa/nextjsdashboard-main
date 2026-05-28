// Middleware intentionally disabled. Route protection is handled in server layouts.
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
