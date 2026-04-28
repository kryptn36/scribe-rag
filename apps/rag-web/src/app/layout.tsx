import type { Metadata } from 'next';

import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import { cn } from '@/shared/lib/utils';
import { TooltipProvider } from '@/shared/ui/components/tooltip';
import { Toaster } from '@/shared/ui/components/sonner';
import { Header } from '@/widgets/header';
import { MeetingRealtime } from '@/features/process-meeting';

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Scribe | RAG Meeting Transcriptions',
  description: 'Transcribe, process, and query your meeting transcriptions with AI-powered Retrieval-Augmented Generation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('dark h-full antialiased', geistSans.variable, geistMono.variable, 'font-mono', jetbrainsMono.variable)}>
      <body className="bg-background text-foreground flex h-full flex-col overflow-hidden">
        <TooltipProvider>
          {/* Background Grid (Aceternity style) */}
          <div className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
            <div className="bg-primary/20 absolute top-0 right-0 left-0 -z-10 m-auto h-77.5 w-77.5 rounded-full opacity-40 blur-[100px]"></div>
          </div>

          <Header />
          {children}
          <MeetingRealtime />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
