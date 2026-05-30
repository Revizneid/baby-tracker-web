import BabyDashboardClient from './BabyDashboardClient';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export const metadata = {
  title: 'Bảng điều khiển bé | BabyTracker',
  description: 'Xem tóm tắt hoạt động, biểu đồ và nhật ký của bé yêu trong gia đình của bạn.',
};

export default async function BabyDashboardPage({ params }: PageProps) {
  const { babyId } = await params;
  return <BabyDashboardClient babyId={babyId} />;
}


