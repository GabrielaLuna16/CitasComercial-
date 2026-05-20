import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Citas CCP & PP',
  description: 'Seguimiento semanal de citas comerciales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
