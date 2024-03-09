import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TanStackProvider from '@/components/providers/tanstack-provider';
import AuthProvider from '@/components/providers/auth-provider';
import { ConfettiProvider } from '@/components/providers/confetti-provider';
import { ToastProvider } from '@/components/providers/toaster-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'PulseLMS',
    description: 'LMS project',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <TanStackProvider>
                    <AuthProvider>
                        <ConfettiProvider />
                        <ToastProvider />
                        {children}
                    </AuthProvider>
                </TanStackProvider>
            </body>
        </html>
    );
}
