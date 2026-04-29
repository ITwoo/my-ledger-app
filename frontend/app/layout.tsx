import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "가계부",
  description: "연간/monthly 지출 관리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-6 h-14 items-center">
              <Link href="/" className="font-semibold text-gray-800 hover:text-blue-600">가계부</Link>
              <Link href="/ai" className="text-gray-600 hover:text-blue-600">AI 입력</Link>
              <Link href="/stats" className="text-gray-600 hover:text-blue-600">통계</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
