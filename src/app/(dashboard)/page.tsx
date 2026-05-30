import DashboardIndexClient from './DashboardIndexClient';

export const metadata = {
  title: 'Dashboard | BabyTracker',
  description: 'Bảng điều khiển để quản lý hành trình bé yêu và gia đình cùng nhau.',
};

export default function DashboardIndexPage() {
  return <DashboardIndexClient />;
}

