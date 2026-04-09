import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DataInitializer } from "@/components/DataInitializer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema de Controle de Estoque",
  description: "Controle de estoque de roupas com autenticação e dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <DataInitializer />
        {children}
      </body>
    </html>
  );
}
