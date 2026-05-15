import { create } from 'zustand';
import { Baby, FeedLog, SleepLog, DiaperLog, GrowthLog } from '@/types/database';
import { babyService } from '@/lib/services/babyService';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  feeds: FeedLog[];
  sleeps: SleepLog[];
  diapers: DiaperLog[];
  growths: GrowthLog[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby | null) => void;
  fetchLogs: (babyId: string) => Promise<void>;
  addFeed: (feed: Omit<FeedLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addSleep: (sleep: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addDiaper: (diaper: Omit<DiaperLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteLog: (table: string, id: string) => Promise<void>;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  currentBaby: null,
  feeds: [],
  sleeps: [],
  diapers: [],
  growths: [],
  loading: false,
  error: null,

  fetchBabies: async () => {
    set({ loading: true });
    try {
      const babies = await babyService.getBabies();
      set({ babies, loading: false });
      if (babies.length > 0 && !get().currentBaby) {
        set({ currentBaby: babies[0] });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  setCurrentBaby: (baby) => {
    set({ currentBaby: baby });
    if (baby) {
      get().fetchLogs(baby.id);
    }
  },

  fetchLogs: async (babyId) => {
    set({ loading: true });
    try {
      const [feeds, sleeps, diapers, growths] = await Promise.all([
        babyService.getFeeds(babyId),
        babyService.getSleepLogs(babyId),
        babyService.getDiaperLogs(babyId),
        babyService.getGrowthLogs(babyId),
      ]);
      set({ feeds, sleeps, diapers, growths, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeToLogs: (babyId: string) => {
    const { supabase } = require('@/lib/supabase');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `baby_id=eq.${babyId}` },
        () => {
          // Refresh logs when any change occurs
          get().fetchLogs(babyId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  addFeed: async (feed) => {
    try {
      const newFeed = await babyService.addFeed(feed);
      set((state) => ({ feeds: [newFeed, ...state.feeds] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addSleep: async (sleep) => {
    try {
      const newSleep = await babyService.addSleepLog(sleep);
      set((state) => ({ sleeps: [newSleep, ...state.sleeps] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addDiaper: async (diaper) => {
    try {
      const newDiaper = await babyService.addDiaperLog(diaper);
      set((state) => ({ diapers: [newDiaper, ...state.diapers] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteLog: async (table, id) => {
    try {
      await babyService.deleteItem(table, id);
      // Update local state based on table
      if (table === 'feeds') set((state) => ({ feeds: state.feeds.filter(f => f.id !== id) }));
      if (table === 'sleep_logs') set((state) => ({ sleeps: state.sleeps.filter(s => s.id !== id) }));
      if (table === 'diaper_logs') set((state) => ({ diapers: state.diapers.filter(d => d.id !== id) }));
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
