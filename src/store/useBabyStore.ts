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

  // Granular loading states
  loadingFeeds: boolean;
  loadingSleeps: boolean;
  loadingDiapers: boolean;
  loadingGrowths: boolean;
  loadingReminders: boolean;
  loadingWaterLogs: boolean;
  loadingPumpingLogs: boolean;
  loadingMilkStorage: boolean;

  // Actions
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby | null) => void;
  fetchLogs: (babyId: string) => Promise<void>;
  fetchFeeds: (babyId: string, limit?: number) => Promise<void>;
  fetchSleeps: (babyId: string, limit?: number) => Promise<void>;
  fetchDiapers: (babyId: string, limit?: number) => Promise<void>;
  fetchPumpingLogs: (babyId: string, limit?: number) => Promise<void>;
  fetchMilkStorage: (babyId: string, limit?: number) => Promise<void>;
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
  fetchSingleTable: (table: string, babyId: string) => Promise<void>;
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

  loadingFeeds: false,
  loadingSleeps: false,
  loadingDiapers: false,
  loadingGrowths: false,
  loadingReminders: false,
  loadingWaterLogs: false,
  loadingPumpingLogs: false,
  loadingMilkStorage: false,

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
      // Fetch only the dashboard essentials with a limit of 50
      const [feeds, sleeps, diapers] = await Promise.all([
        babyService.getFeeds(babyId, 50),
        babyService.getSleepLogs(babyId, 50),
        babyService.getDiaperLogs(babyId, 50),
      ]);
      set({ feeds, sleeps, diapers, loading: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu hoạt động.';
      set({ error: errorMsg, loading: false });
    }
  },

  fetchFeeds: async (babyId, limit) => {
    if (!babyId) return;
    set({ loadingFeeds: true });
    try {
      const feeds = await babyService.getFeeds(babyId, limit);
      set({ feeds, loadingFeeds: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu ăn uống.';
      set({ error: errorMsg, loadingFeeds: false });
    }
  },

  fetchSleeps: async (babyId, limit) => {
    if (!babyId) return;
    set({ loadingSleeps: true });
    try {
      const sleeps = await babyService.getSleepLogs(babyId, limit);
      set({ sleeps, loadingSleeps: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu giấc ngủ.';
      set({ error: errorMsg, loadingSleeps: false });
    }
  },

  fetchDiapers: async (babyId, limit) => {
    if (!babyId) return;
    set({ loadingDiapers: true });
    try {
      const diapers = await babyService.getDiaperLogs(babyId, limit);
      set({ diapers, loadingDiapers: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu thay tã.';
      set({ error: errorMsg, loadingDiapers: false });
    }
  },

  fetchPumpingLogs: async (babyId, limit) => {
    if (!babyId) return;
    set({ loadingPumpingLogs: true });
    try {
      const pumpingLogs = await babyService.getPumpingLogs(babyId, limit);
      set({ pumpingLogs, loadingPumpingLogs: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu hút sữa.';
      set({ error: errorMsg, loadingPumpingLogs: false });
    }
  },

  fetchMilkStorage: async (babyId, limit) => {
    if (!babyId) return;
    set({ loadingMilkStorage: true });
    try {
      const milkStorage = await babyService.getMilkStorage(babyId, limit);
      set({ milkStorage, loadingMilkStorage: false, error: null });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Không thể tải dữ liệu kho sữa.';
      set({ error: errorMsg, loadingMilkStorage: false });
    }
  },

  fetchSingleTable: async (table, babyId) => {
    if (!babyId) return;
    try {
      if (table === 'feeds') {
        const feeds = await babyService.getFeeds(babyId);
        set({ feeds });
      } else if (table === 'sleep_logs') {
        const sleeps = await babyService.getSleepLogs(babyId);
        set({ sleeps });
      } else if (table === 'diaper_logs') {
        const diapers = await babyService.getDiaperLogs(babyId);
        set({ diapers });
      } else if (table === 'pumping_logs') {
        const pumpingLogs = await babyService.getPumpingLogs(babyId);
        set({ pumpingLogs });
      } else if (table === 'growth_logs') {
        const growths = await babyService.getGrowthLogs(babyId);
        set({ growths });
      } else if (table === 'milk_storage') {
        const milkStorage = await babyService.getMilkStorage(babyId);
        set({ milkStorage });
      }
    } catch (err: any) {
      console.error(`[Store] Error refetching table ${table}:`, err);
    }
  },

  subscribeToLogs: (babyId: string) => {
    if (!babyId) {
      return () => {};
    }

    const trackedTables = [
      { name: 'feeds', stateKey: 'feeds' as const },
      { name: 'sleep_logs', stateKey: 'sleeps' as const },
      { name: 'diaper_logs', stateKey: 'diapers' as const },
      { name: 'pumping_logs', stateKey: 'pumpingLogs' as const },
      { name: 'growth_logs', stateKey: 'growths' as const },
      { name: 'milk_storage', stateKey: 'milkStorage' as const },
    ];

    const sortState = (key: string, arr: any[]) => {
      if (key === 'feeds' || key === 'diapers' || key === 'pumpingLogs') {
        return [...arr].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      if (key === 'sleeps') {
        return [...arr].sort((a, b) => (b.start_timestamp || 0) - (a.start_timestamp || 0));
      }
      if (key === 'growths') {
        return [...arr].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      }
      if (key === 'milkStorage') {
        return [...arr].sort((a, b) => (a.expires_at || '').localeCompare(b.expires_at || ''));
      }
      return arr;
    };

    const channel = supabase.channel(`baby-logs-${babyId}`);
    
    trackedTables.forEach(({ name: table, stateKey }) => {
      channel
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table, filter: `baby_id=eq.${babyId}` },
          (payload) => {
            const newRecord = payload.new;
            if (!newRecord) return;
            set((state) => {
              const currentList = state[stateKey] as any[];
              if (currentList.some((item) => item.id === newRecord.id)) return {};
              return { [stateKey]: sortState(stateKey, [newRecord, ...currentList]) };
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table, filter: `baby_id=eq.${babyId}` },
          (payload) => {
            const updatedRecord = payload.new;
            if (!updatedRecord) return;
            set((state) => {
              const currentList = state[stateKey] as any[];
              const updatedList = currentList.map((item) =>
                item.id === updatedRecord.id ? updatedRecord : item
              );
              return { [stateKey]: sortState(stateKey, updatedList) };
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table, filter: `baby_id=eq.${babyId}` },
          (payload) => {
            const oldRecord = payload.old;
            if (!oldRecord || !oldRecord.id) return;
            set((state) => {
              const currentList = state[stateKey] as any[];
              const filteredList = currentList.filter((item) => item.id !== oldRecord.id);
              return { [stateKey]: filteredList };
            });
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
    set({ loadingGrowths: true });
    try {
      const growths = await babyService.getGrowthLogs(babyId);
      set({ growths, loadingGrowths: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loadingGrowths: false });
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
    set({ loadingReminders: true });
    try {
      const reminders = await babyService.getReminders(babyId);
      set({ reminders, loadingReminders: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loadingReminders: false });
      throw err;
    }
  },

  fetchWaterLogs: async () => {
    set({ loadingWaterLogs: true });
    try {
      const waterLogs = await babyService.getWaterLogs();
      set({ waterLogs, loadingWaterLogs: false, error: null });
    } catch (err: any) {
      set({ error: err.message, loadingWaterLogs: false });
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
