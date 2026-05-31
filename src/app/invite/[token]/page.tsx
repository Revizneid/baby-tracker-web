import InviteClient from './InviteClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';
  const url = `${appUrl.replace(/\/$/, '')}/invite/${token}`;
  return {
    title: 'Bạn được mời tham gia gia đình | BabyTracker',
    description: 'Nhấn để tham gia gia đình và quản lý hành trình bé yêu trên BabyTracker.',
    openGraph: {
      title: 'Bạn được mời tham gia gia đình | BabyTracker',
      description: 'Tham gia gia đình để cùng quản lý hành trình phát triển của bé.',
      url,
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  return <InviteClient token={token} />;
}

