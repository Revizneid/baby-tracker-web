import { NextResponse } from 'next/server';
import familyActions from '@/lib/actions/family';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    const member = await familyActions.acceptInvite(token);
    return NextResponse.json({ member });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to accept invite' }, { status: 500 });
  }
}
