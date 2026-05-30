import InviteClient from './InviteClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Gia nhập gia đình | BabyTracker',
  description: 'Nhận lời mời tham gia gia đình và cùng quản lý hành trình phát triển của bé.',
};

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  return <InviteClient token={token} />;
}

