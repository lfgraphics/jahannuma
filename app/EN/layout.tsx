import { Harmattan } from 'next/font/google';

const harmattan = Harmattan({
  weight: '400'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${harmattan.className}`}>
      {children}
    </div>
  );
}
