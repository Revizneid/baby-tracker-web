'use client';

import { useMemo } from 'react';

const DAILY_TIPS = [
  {
    day: 0,
    emoji: '💡',
    title: 'Tần suất bú',
    text: 'Bé 0-3 tháng cần bú 8-12 lần/ngày. Đừng lo nếu bé bú ít mỗi cữ!'
  },
  {
    day: 1,
    emoji: '🌙',
    title: 'Giấc ngủ đêm',
    text: 'Giấc ngủ đêm 6-8 tiếng là bình thường với bé trên 3 tháng'
  },
  {
    day: 2,
    emoji: '🧷',
    title: 'Kiểm tra tã',
    text: 'Thay tã 8-12 lần/ngày là dấu hiệu bé được bú đủ'
  },
  {
    day: 3,
    emoji: '💪',
    title: 'Tư thế bú đúng',
    text: 'Bé nên nắm chặt miệng xung quanh toàn bộ núm vú, không chỉ phần núm'
  },
  {
    day: 4,
    emoji: '🌡️',
    title: 'Kiểm tra nhiệt độ',
    text: 'Nhiệt độ bé bình thường là 36.5-37.5°C. Đo bằng tay mẹ ở cổ bé'
  },
  {
    day: 5,
    emoji: '🏃‍♀️',
    title: 'Vận động nhẹ',
    text: 'Massage và vận động giúp tiêu hóa tốt hơn cho bé'
  },
  {
    day: 6,
    emoji: '👶',
    title: 'Tình cảm gắn kết',
    text: 'Bế bé, nói chuyện và tiếp xúc da với da giúp bé phát triển tốt'
  }
];

export default function DailyTip() {
  const tip = useMemo(() => {
    const today = new Date().getDay();
    return DAILY_TIPS[today];
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#1D9E75]/10 via-emerald-50/50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 font-sans">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{tip.emoji}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1D9E75] text-sm sm:text-base">
            {tip.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            {tip.text}
          </p>
        </div>
      </div>
      <div className="pt-2 text-xs text-gray-400">
        💚 Mẹo hàng ngày từ các chuyên gia
      </div>
    </div>
  );
}
