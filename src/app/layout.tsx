import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VQueue | Smart Virtual Queuing',
  description: 'Join queues virtually, track your status in real-time, and arrive just on time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
