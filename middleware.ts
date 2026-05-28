import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth(async (request) => {
  if (!request.auth?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
