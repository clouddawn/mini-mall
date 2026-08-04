import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Serif_SC, Noto_Sans_SC, Fraunces } from "next/font/google";
import "./globals.css";

const serifSc = Noto_Serif_SC({
  variable: "--font-serif-sc",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const sansSc = Noto_Sans_SC({
  variable: "--font-sans-sc",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Mall · 微型精品商城",
  description: "精选好物，小而美的购物体验",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${serifSc.variable} ${sansSc.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col paper-noise">{children}</body>
    </html>
  );
}
