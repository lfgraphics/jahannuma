import { Tiro_Devanagari_Hindi } from 'next/font/google';

const harmattan = Tiro_Devanagari_Hindi({
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
