import { NextResponse } from 'next/server';
import familyActions from '@/lib/actions/family';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const babyId = url.searchParams.get('babyId');
    if (!babyId) return NextResponse.json({ error: 'babyId required' }, { status: 400 });

    const members = await familyActions.getMembers(babyId);
    return NextResponse.json({ members });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 });
  }
}
