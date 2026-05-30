import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Baby, FeedLog, SleepLog, DiaperLog, GrowthLog, PumpingLog, MilkStorage, Reminder, WaterLog } from '@/types/database';
import { babyService } from '@/lib/services/babyService';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  feeds: FeedLog[];
  sleeps: SleepLog[];
  diapers: DiaperLog[];
  growths: GrowthLog[];
  reminders: Reminder[];
  waterLogs: WaterLog[];
  pumpingLogs: PumpingLog[];
  milkStorage: MilkStorage[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby | null) => void;
  fetchLogs: (babyId: string) => Promise<void>;
  fetchGrowthLogs: (babyId: string) => Promise<void>;
  fetchReminders: (babyId: string) => Promise<void>;
  fetchWaterLogs: () => Promise<void>;
  addFeed: (feed: Omit<FeedLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addSleep: (sleep: Omit<SleepLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addDiaper: (diaper: Omit<DiaperLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addGrowth: (growth: Omit<GrowthLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addPumping: (log: Omit<PumpingLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addMilk: (item: Omit<MilkStorage, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReminder: (id: string, patch: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addWaterLog: (amountMl: number) => Promise<void>;
  deleteWaterLog: (id: string) => Promise<void>;
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
  reminders: [],
  waterLogs: [],
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
      const [feeds, sleeps, diapers, growths, reminders, pumpingLogs, milkStorage] = await Promise.all([
        babyService.getFeeds(babyId),
        babyService.getSleepLogs(babyId),
        babyService.getDiaperLogs(babyId),
        babyService.getGrowthLogs(babyId),
        babyService.getReminders(babyId),
        babyService.getPumpingLogs(babyId),
        babyService.getMilkStorage(babyId),
      ]);
      set({ feeds, sleeps, diapers, growths, reminders, pumpingLogs, milkStorage, loading: false, error: null });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải dữ liệu hoạt động.', loading: false });
    }
  },

  subscribeToLogs: (babyId: string) => {
    if (!babyId) {
      return () => {};
    }

    const trackedTables = [
      'feeds',
      'sleep_logs',
      'diaper_logs',
      'pumping_logs',
      'growth_logs',
      'water_logs',
      'milk_storage',
    ];

    const channel = supabase.channel(`baby-logs-${babyId}`);
    trackedTables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, filter: `baby_id=eq.${babyId}` },
        () => {
          get().fetchLogs(babyId);
        }
      );
    });

    void channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  },

  addFeed: async (feed) => {
    try {
      const newFeed = await babyService.addFeed(feed);
      set((state) => ({ feeds: [newFeed, ...state.feeds] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addPumping: async (log) => {
    try {
      const newLog = await babyService.addPumpingLog(log);
      set((state) => ({ pumpingLogs: [newLog, ...state.pumpingLogs] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addMilk: async (item) => {
    try {
      const newItem = await babyService.addMilkStorage(item);
      set((state) => ({ milkStorage: [newItem, ...state.milkStorage] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
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
      throw err;
    }
  },

  addSleep: async (sleep) => {
    try {
      const newSleep = await babyService.addSleepLog(sleep);
      set((state) => ({ sleeps: [newSleep, ...state.sleeps] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addDiaper: async (diaper) => {
    try {
      const newDiaper = await babyService.addDiaperLog(diaper);
      set((state) => ({ diapers: [newDiaper, ...state.diapers] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addGrowth: async (growth) => {
    try {
      const newGrowth = await babyService.addGrowthLog(growth);
      set((state) => ({ growths: [newGrowth, ...state.growths] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchGrowthLogs: async (babyId) => {
    set({ loading: true });
    try {
      const growths = await babyService.getGrowthLogs(babyId);
      set({ growths, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addReminder: async (reminder) => {
    try {
      const newReminder = await babyService.addReminder(reminder);
      set((state) => ({ reminders: [newReminder, ...state.reminders] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateReminder: async (id, patch) => {
    try {
      const updated = await babyService.updateReminder(id, patch);
      set((state) => ({ reminders: state.reminders.map((item) => (item.id === id ? updated : item)) }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteReminder: async (id) => {
    try {
      await babyService.deleteReminder(id);
      set((state) => ({ reminders: state.reminders.filter((item) => item.id !== id) }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchReminders: async (babyId) => {
    set({ loading: true });
    try {
      const reminders = await babyService.getReminders(babyId);
      set({ reminders, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchWaterLogs: async () => {
    set({ loading: true });
    try {
      const waterLogs = await babyService.getWaterLogs();
      set({ waterLogs, loading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addWaterLog: async (amountMl) => {
    try {
      const newLog = await babyService.addWaterLog(amountMl);
      set((state) => ({ waterLogs: [newLog, ...state.waterLogs] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteWaterLog: async (id) => {
    try {
      await babyService.deleteWaterLog(id);
      set((state) => ({ waterLogs: state.waterLogs.filter((item) => item.id !== id) }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
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
      if (table === 'growth_logs') set((state) => ({ growths: state.growths.filter(g => g.id !== id) }));
      if (table === 'reminders') set((state) => ({ reminders: state.reminders.filter(r => r.id !== id) }));
      if (table === 'water_logs') set((state) => ({ waterLogs: state.waterLogs.filter(w => w.id !== id) }));
    } catch (err: any) {
      set({ error: err?.message || 'Không thể xóa nhật ký.' });
      throw err;
    }
  }
}));
