// ─────────────────────────────────────────────────────────────────
// KURUTA Web — Root Layout
// ─────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "cyrillic"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "KURUTA — Маркетплейс рекламных размещений",
  description: "Двусторонний маркетплейс рекламных размещений",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
