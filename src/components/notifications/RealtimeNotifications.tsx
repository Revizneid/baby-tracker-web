'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useBabyStore } from '@/store/useBabyStore';
import ActivityToast from '@/components/ui/ActivityToast';

const ACTIVITY_TABLES = [
  'feeds',
  'sleep_logs',
  'diaper_logs',
  'pumping_logs',
  'growth_logs',
  'water_logs',
  'milk_storage',
] as const;

type ActivityTable = (typeof ACTIVITY_TABLES)[number];

const formatNotification = (table: ActivityTable, record: any) => {
  switch (table) {
    case 'feeds':
      return `Gia đình vừa thêm mục ăn: ${record.amount ?? 'nhiều'}ml ${record.type === 'formula' ? 'sữa công thức' : 'bú mẹ'}.`;
    case 'sleep_logs':
      return 'Gia đình vừa thêm một giấc ngủ mới.';
    case 'diaper_logs':
      return 'Gia đình vừa thêm bản ghi thay tã mới.';
    case 'pumping_logs':
      return 'Gia đình vừa thêm bản ghi hút sữa mới.';
    case 'growth_logs':
      return 'Gia đình vừa cập nhật chỉ số tăng trưởng mới.';
    case 'water_logs':
      return 'Gia đình vừa thêm bản ghi uống nước.';
    case 'milk_storage':
      return 'Gia đình vừa thêm mục kho sữa mới.';
    default:
      return 'Có hoạt động mới từ gia đình.';
  }
};

export default function RealtimeNotifications() {
  const { user } = useAuth();
  const { currentBaby, fetchLogs } = useBabyStore();
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentBaby || !user) {
      return;
    }

    const channel = supabase.channel(`realtime-activity-${currentBaby.id}`);

    ACTIVITY_TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table, filter: `baby_id=eq.${currentBaby.id}` },
        (payload) => {
          const record = payload.record ?? {};
          const isSelfAction = record.user_id && record.user_id === user.id;

          if (!isSelfAction) {
            setMessage(formatNotification(table, record));
          }

          fetchLogs(currentBaby.id);
        }
      );
    });

    void channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [currentBaby, user, fetchLogs]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 4200);
    return () => clearTimeout(timer);
  }, [message]);

  return <ActivityToast visible={!!message} message={message} />;
}
