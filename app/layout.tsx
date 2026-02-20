import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 🟢 [NEW] 방금 만든 문지기 불러오기
import AuthGuard from "./components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Control Hub",
  description: "AI Model & Dataset Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 🟢 [NEW] AuthGuard로 전체 앱을 감싸줍니다! */}
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}