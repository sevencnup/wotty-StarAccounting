import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppPreferences } from "@/components/stark/AppPreferences";
import { AppUpdatePrompt } from "@/components/stark/AppUpdatePrompt";

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
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body style={{ visibility: "hidden" }}>
        <AppPreferences />
        <AppUpdatePrompt />
        {children}
      </body>
    </html>
  );
}
