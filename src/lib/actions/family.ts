import { createServerClient } from '../supabase/server';
import { FamilyInvite, FamilyMember } from '@/types/database';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export const familyActions = {
  async createInviteLink(babyId: string) {
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is already a family member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('*')
      .eq('baby_id', invite.baby_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      // Mark invite as used if not already marked
      if (!invite.used_at) {
        await supabase
          .from('family_invites')
          .update({ used_at: new Date().toISOString() })
          .eq('id', invite.id);
      }
      return existingMember as FamilyMember;
    }

    if (invite.used_at) {
      throw new Error('Invite already used');
    }

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
    const supabase = await createServerClient();
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
    const supabase = await createServerClient();
    
    // Fetch the baby's owner profile first
    const { data: babyData } = await supabase
      .from('babies')
      .select('user_id, profiles(full_name, avatar_url, id)')
      .eq('id', babyId)
      .single();

    const { data, error } = await supabase
      .from('family_members')
      .select('id, role, created_at, profiles(full_name, avatar_url, id)')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const members = (data || []) as any[];

    // Check if owner is already present
    const hasOwner = members.some(m => {
      const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return m.role === 'owner' || (profile && babyData && profile.id === babyData.user_id);
    });

    if (!hasOwner && babyData) {
      const ownerProfile = babyData.profiles;
      if (ownerProfile) {
        members.unshift({
          id: `owner-${babyData.user_id}`,
          role: 'owner',
          created_at: new Date().toISOString(),
          profiles: Array.isArray(ownerProfile) ? ownerProfile : [ownerProfile]
        });
      }
    }

    return members as Array<{
      id: string;
      role: 'owner' | 'member';
      created_at?: string;
      profiles?: { id: string; full_name: string; avatar_url: string }[];
    }>;
  },
};

export default familyActions;
