import { verifySession } from '@/app/lib/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './app/types/auth.d';


export async function proxy(req: NextRequest) {
  const token = req.cookies.get('session')?.value;


  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }


  try {
    const session = await verifySession(token);


    if (req.nextUrl.pathname.startsWith('/admin') && session.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/403', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}


export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};