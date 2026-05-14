import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Smart Job Tracker — AI-Powered Job Alert System',
  description:
    'Track, filter, and get notified about the latest job listings scraped from top Philippine job boards. Never miss an opportunity.',
  keywords: 'job tracker, job alerts, philippines jobs, react jobs, developer jobs, job scraper',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'Smart Job Tracker',
    description: 'AI-powered job scraping and alert system for Filipino developers',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen antialiased text-slate-900 overflow-x-hidden`}
        suppressHydrationWarning
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-[9999]"
        />
      </body>
    </html>
  );
}
