import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppPreferences } from "@/components/stark/AppPreferences";
import { AppUpdatePrompt } from "@/components/stark/AppUpdatePrompt";
import { ConfirmDialogProvider } from "@/components/stark/ConfirmDialogProvider";

export const metadata: Metadata = {
  title: "wotty stark web",
  description: "wotty stark web app",
  icons: {
    icon: {
      url: `${process.env.NEXT_PUBLIC_APP_BASE_PATH ?? ""}/logo.png`,
      type: "image/png",
    },
  },
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
      <body>
        <AppPreferences />
        <AppUpdatePrompt />
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </body>
    </html>
  );
}
