import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PivoCloud Demo — Mini CRM",
  description:
    "Mini CRM démo connecté à PostgreSQL via DATABASE_URL — Workshop ANPT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[var(--surface-body)] font-sans text-slate-300">
        {children}
        <footer className="mt-auto border-t border-white/6 bg-[var(--surface-darkest)] py-3 text-center text-xs text-slate-500">
          Données stockées sur PostgreSQL managé par PivoCloud
        </footer>
      </body>
    </html>
  );
}
