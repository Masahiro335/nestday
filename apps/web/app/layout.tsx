export const metadata = {
  title: 'Calendar Share',
  description: 'Group-based calendar sharing app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
