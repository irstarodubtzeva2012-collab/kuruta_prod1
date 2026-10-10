import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-space-grotesk',
});

export const meta Metadata = {
  title: 'KURUTA — Маркетплейс рекламных размещений',
  description: 'Двусторонний маркетплейс рекламных размещений',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // В реальном приложении получаем роли пользователя из API
  const userRoles = ['creator', 'ambassador', 'owner'];

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RoleProvider userRoles={userRoles}>
              {children}
            </RoleProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
