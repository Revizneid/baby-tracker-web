import { supabase } from '../supabase';
import { Baby, FeedLog, SleepLog, DiaperLog, GrowthLog } from '@/types/database';

export const babyService = {
  // Babies
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

  // Feeds
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

  // Sleep
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

  // Diapers
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

  // Growth
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

  // Pumping
  async getPumpingLogs() {
    const { data, error } = await supabase
      .from('pumping_logs')
      .select('*')
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

  // Milk Storage
  async getMilkStorage() {
    const { data, error } = await supabase
      .from('milk_storage')
      .select('*')
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

  // Deletion helpers
  async deleteItem(table: string, id: string) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
