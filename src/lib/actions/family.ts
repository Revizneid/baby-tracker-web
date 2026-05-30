import { supabase } from '../supabase';
import { FamilyInvite, FamilyMember } from '@/types/database';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export const familyActions = {
  async createInviteLink(babyId: string) {
    const token = (globalThis as any)?.crypto?.randomUUID?.() ?? String(Date.now());
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('family_invites')
      .insert([{ baby_id: babyId, token, expires_at }])
      .select()
      .single();

    if (error) throw error;

    const url = `${APP_URL.replace(/\/$/, '')}/invite/${token}`;
    return { invite: data as FamilyInvite, url };
  },

  async acceptInvite(token: string) {
    const { data: invite, error: findErr } = await supabase
      .from('family_invites')
      .select('*')
      .eq('token', token)
      .single();
    if (findErr) throw findErr;
    if (!invite) throw new Error('Invite not found');

    const now = new Date();
    if (invite.expires_at && new Date(invite.expires_at) < now) {
      throw new Error('Invite has expired');
    }
    if (invite.used_at) {
      throw new Error('Invite already used');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Insert into family_members
    const { data: member, error: insErr } = await supabase
      .from('family_members')
      .insert([{ baby_id: invite.baby_id, user_id: user.id, role: 'member' }])
      .select()
      .single();
    if (insErr) throw insErr;

    // Mark invite as used
    const { error: updErr } = await supabase
      .from('family_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id);
    if (updErr) throw updErr;

    return member as FamilyMember;
  },

  async removeMember(memberId: string, babyId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // verify requester is owner of the baby
    const { data: ownerCheck, error: ownerErr } = await supabase
      .from('family_members')
      .select('*')
      .eq('baby_id', babyId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();
    if (ownerErr) throw ownerErr;
    if (!ownerCheck) throw new Error('Only owner can remove members');

    const { error } = await supabase.from('family_members').delete().eq('id', memberId);
    if (error) throw error;

    return true;
  },

  async getMembers(babyId: string) {
    const { data, error } = await supabase
      .from('family_members')
      .select('id, role, created_at, profiles(full_name, avatar_url, id)')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Array<{
      id: string;
      role: 'owner' | 'member';
      created_at?: string;
      profiles?: { id: string; full_name: string; avatar_url: string }[];
    }>;
  },
};

export default familyActions;
