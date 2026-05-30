import { supabase } from '../supabase';
import { 
  Baby, 
  FeedLog, 
  SleepLog, 
  DiaperLog, 
  GrowthLog, 
  PumpingLog, 
  MilkStorage,
  Profile,
  FamilyMember,
  FamilyInvite,
  VaccineRecord,
  Reminder,
  WaterLog
} from '@/types/database';

export const babyService = {
  // =========================================================================
  // BABIES
  // =========================================================================
  async getBabies() {
    const { data, error } = await supabase
      .from('babies')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Baby[];
  },

  async addBaby(baby: Omit<Baby, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('babies')
      .insert([{ ...baby, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as Baby;
  },

  // =========================================================================
  // PROFILES
  // =========================================================================
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(patch: Partial<Profile>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  // =========================================================================
  // FAMILY MEMBERS & INVITES
  // =========================================================================
  async getFamilyMembers(babyId: string) {
    const { data, error } = await supabase
      .from('family_members')
      .select('*, profiles(*)')
      .eq('baby_id', babyId);
    if (error) throw error;
    return data;
  },

  async removeFamilyMember(memberId: string) {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
  },

  async createInvite(babyId: string) {
    const { data, error } = await supabase
      .from('family_invites')
      .insert([{ baby_id: babyId }])
      .select()
      .single();
    if (error) throw error;
    return data as FamilyInvite;
  },

  async getInvite(token: string) {
    const { data, error } = await supabase
      .from('family_invites')
      .select('*, babies(name)')
      .eq('token', token)
      .single();
    if (error) throw error;
    return data;
  },

  async acceptInvite(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const invite = await this.getInvite(token);
    if (!invite || invite.used_at || new Date(invite.expires_at) < new Date()) {
      throw new Error('Lời mời không hợp lệ, đã được sử dụng hoặc hết hạn.');
    }

    // Insert family member
    const { error: memberError } = await supabase
      .from('family_members')
      .insert([{ baby_id: invite.baby_id, user_id: user.id, role: 'member' }]);
    
    // Ignore duplicate key errors if already a member
    if (memberError && memberError.code !== '23505') {
      throw memberError;
    }

    // Mark invite as used
    const { error: inviteError } = await supabase
      .from('family_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id);
    if (inviteError) throw inviteError;

    return invite.baby_id;
  },

  // =========================================================================
  // FEEDS (Note: Keeps existing feeds table name)
  // =========================================================================
  async getFeeds(babyId: string) {
    const { data, error } = await supabase
      .from('feeds')
      .select('*')
      .eq('baby_id', babyId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data as FeedLog[];
  },

  async addFeed(feed: Omit<FeedLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('feeds')
      .insert([{ ...feed, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as FeedLog;
  },

  // =========================================================================
  // SLEEP LOGS
  // =========================================================================
  async getSleepLogs(babyId: string) {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('baby_id', babyId)
      .order('start_timestamp', { ascending: false });
    if (error) throw error;
    return data as SleepLog[];
  },

  async addSleepLog(log: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sleep_logs')
      .insert([{ ...log, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as SleepLog;
  },

  // =========================================================================
  // DIAPER LOGS
  // =========================================================================
  async getDiaperLogs(babyId: string) {
    const { data, error } = await supabase
      .from('diaper_logs')
      .select('*')
      .eq('baby_id', babyId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data as DiaperLog[];
  },

  async addDiaperLog(log: Omit<DiaperLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('diaper_logs')
      .insert([{ ...log, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as DiaperLog;
  },

  // =========================================================================
  // GROWTH LOGS
  // =========================================================================
  async getGrowthLogs(babyId: string) {
    const { data, error } = await supabase
      .from('growth_logs')
      .select('*')
      .eq('baby_id', babyId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data as GrowthLog[];
  },

  async addGrowthLog(log: Omit<GrowthLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('growth_logs')
      .insert([{ ...log, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as GrowthLog;
  },

  // =========================================================================
  // PUMPING LOGS (Note: Keeps existing pumping_logs table name)
  // =========================================================================
  async getPumpingLogs(babyId: string) {
    const { data, error } = await supabase
      .from('pumping_logs')
      .select('*')
      .eq('baby_id', babyId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data as PumpingLog[];
  },

  async addPumpingLog(log: Omit<PumpingLog, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('pumping_logs')
      .insert([{ ...log, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as PumpingLog;
  },

  // =========================================================================
  // MILK STORAGE
  // =========================================================================
  async getMilkStorage(babyId: string) {
    const { data, error } = await supabase
      .from('milk_storage')
      .select('*')
      .eq('baby_id', babyId)
      .order('expires_at', { ascending: true });
    if (error) throw error;
    return data as MilkStorage[];
  },

  async addMilkStorage(item: Omit<MilkStorage, 'id' | 'user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('milk_storage')
      .insert([{ ...item, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as MilkStorage;
  },

  async updateMilkStorage(id: string, patch: Partial<MilkStorage>) {
    const { error } = await supabase
      .from('milk_storage')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
  },

  // =========================================================================
  // VACCINE RECORDS
  // =========================================================================
  async getVaccineRecords(babyId: string) {
    const { data, error } = await supabase
      .from('vaccine_records')
      .select('*')
      .eq('baby_id', babyId)
      .order('vacc_date', { ascending: false });
    if (error) throw error;
    return data as VaccineRecord[];
  },

  async upsertVaccineRecord(record: { id?: string; baby_id: string; vaccine_id: string; vacc_date: string; brand?: string; note?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('vaccine_records')
      .upsert({ ...record, user_id: user.id }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data as VaccineRecord;
  },

  async deleteVaccineRecord(id: string) {
    const { error } = await supabase
      .from('vaccine_records')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // =========================================================================
  // REMINDERS
  // =========================================================================
  async getReminders(babyId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Reminder[];
  },

  async addReminder(reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reminders')
      .insert([{ ...reminder, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as Reminder;
  },

  async updateReminder(id: string, patch: Partial<Reminder>) {
    const { data, error } = await supabase
      .from('reminders')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Reminder;
  },

  async deleteReminder(id: string) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // =========================================================================
  // WATER LOGS (Mother)
  // =========================================================================
  async getWaterLogs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false });
    if (error) throw error;
    return data as WaterLog[];
  },

  async addWaterLog(amountMl: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('water_logs')
      .insert([{ amount_ml: amountMl, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data as WaterLog;
  },

  async deleteWaterLog(id: string) {
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // =========================================================================
  // DELETION HELPERS
  // =========================================================================
  async deleteItem(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
