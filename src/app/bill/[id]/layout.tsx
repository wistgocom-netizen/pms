'use client';

import '@/app/globals.css';

export default function PublicBillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redundant StoreProvider removed as it is already provided by RootLayout
  return (
    <div className="min-h-screen bg-muted/30">
      {children}
    </div>
  );
}
