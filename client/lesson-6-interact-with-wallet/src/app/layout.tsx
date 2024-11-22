import type { Metadata, NextPage } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Lesson 6 - Interact with Wallet',
  description: 'Interact with Solana Wallet',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout: NextPage<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
