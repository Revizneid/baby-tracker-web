import { create } from 'zustand';
import { Baby, FeedLog, SleepLog, DiaperLog, GrowthLog, PumpingLog, MilkStorage } from '@/types/database';
import { babyService } from '@/lib/services/babyService';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  feeds: FeedLog[];
  sleeps: SleepLog[];
  diapers: DiaperLog[];
  growths: GrowthLog[];
  pumpingLogs: PumpingLog[];
  milkStorage: MilkStorage[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby | null) => void;
  fetchLogs: (babyId: string) => Promise<void>;
  addFeed: (feed: Omit<FeedLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addSleep: (sleep: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addDiaper: (diaper: Omit<DiaperLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addPumping: (log: Omit<PumpingLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addMilk: (item: Omit<MilkStorage, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  markMilkUsed: (id: string) => Promise<void>;
  deleteLog: (table: string, id: string) => Promise<void>;
  subscribeToLogs: (babyId: string) => () => void;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  currentBaby: null,
  feeds: [],
  sleeps: [],
  diapers: [],
  growths: [],
  pumpingLogs: [],
  milkStorage: [],
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
    if (!babyId) {
      set({ error: 'Baby ID is required to load logs.', loading: false });
      return;
    }

    set({ loading: true });
    try {
      const [feeds, sleeps, diapers, growths, pumpingLogs, milkStorage] = await Promise.all([
        babyService.getFeeds(babyId),
        babyService.getSleepLogs(babyId),
        babyService.getDiaperLogs(babyId),
        babyService.getGrowthLogs(babyId),
        babyService.getPumpingLogs(babyId),
        babyService.getMilkStorage(babyId),
      ]);
      set({ feeds, sleeps, diapers, growths, pumpingLogs, milkStorage, loading: false, error: null });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải dữ liệu hoạt động.', loading: false });
    }
  },

  subscribeToLogs: (babyId: string) => {
    // Polling fallback: Refresh data every 5 seconds (improved from 30s for better UX)
    // TODO: Replace with Supabase Realtime subscriptions when enabled
    const interval = setInterval(() => {
      get().fetchLogs(babyId);
    }, 5000);

    return () => {
      clearInterval(interval);
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

  addPumping: async (log) => {
    try {
      const newLog = await babyService.addPumpingLog(log);
      set((state) => ({ pumpingLogs: [newLog, ...state.pumpingLogs] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addMilk: async (item) => {
    try {
      const newItem = await babyService.addMilkStorage(item);
      set((state) => ({ milkStorage: [newItem, ...state.milkStorage] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markMilkUsed: async (id) => {
    try {
      await babyService.updateMilkStorage(id, { used: true });
      set((state) => ({
        milkStorage: state.milkStorage.map((m) =>
          m.id === id ? { ...m, used: true } : m
        ),
      }));
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
      if (table === 'pumping_logs') set((state) => ({ pumpingLogs: state.pumpingLogs.filter(p => p.id !== id) }));
    } catch (err: any) {
      set({ error: err?.message || 'Không thể xóa nhật ký.' });
    }
  }
}));
