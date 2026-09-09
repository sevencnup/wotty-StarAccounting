import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppPreferences } from "@/components/stark/AppPreferences";

export const metadata: Metadata = {
  title: "wotty stark web",
  description: "wotty stark web app",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppPreferences />
        {children}
      </body>
    </html>
  );
}
