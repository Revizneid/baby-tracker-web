import { NextResponse } from 'next/server';
import familyActions from '@/lib/actions/family';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { babyId } = body;
    if (!babyId) return NextResponse.json({ error: 'babyId required' }, { status: 400 });

    const result = await familyActions.createInviteLink(babyId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 });
  }
}
