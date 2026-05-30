import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import RegisterSW from '@/components/pwa/RegisterSW';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: '#1D9E75',
};

export const metadata: Metadata = {
  title: {
    default: 'BabyTracker Web',
    template: '%s | BabyTracker',
  },
  description: 'Dõi theo hành trình phát triển của bé yêu bằng nhật ký ăn ngủ, tiêm chủng và chia sẻ cùng gia đình.',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'BabyTracker Web',
    description: 'Dõi theo hành trình phát triển của bé yêu bằng nhật ký ăn ngủ, tiêm chủng và chia sẻ cùng gia đình.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'BabyTracker Web',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BabyTracker Web',
    description: 'Dõi theo hành trình phát triển của bé yêu bằng nhật ký ăn ngủ, tiêm chủng và chia sẻ cùng gia đình.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <RegisterSW />
        </AuthProvider>
      </body>
    </html>
  );
}
