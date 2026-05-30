import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bé yêu | BabyTracker',
  description: 'Xem chi tiết nhật ký và thống kê cho bé yêu của bạn.',
  openGraph: {
    title: 'Bé yêu | BabyTracker',
    description: 'Xem nhật ký ăn ngủ, tiêm chủng và chia sẻ gia đình cho mỗi bé.',
    type: 'website',
  },
};

export default function BabyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
