import SettingsClient from './SettingsClient';

interface PageProps {
  params: Promise<{ babyId: string }>;
}

export const metadata = {
  title: 'Cài đặt bé | BabyTracker',
  description: 'Quản lý thành viên gia đình và link mời cho bé yêu.',
};

export default async function SettingsPage({ params }: PageProps) {
  const { babyId } = await params;
  return <SettingsClient babyId={babyId} />;
}

