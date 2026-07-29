import { MobileBottomNav } from "@/components/stark/MobileBottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #eff8ff 0%, #f6fbff 38%, #eef7ff 100%)",
      }}
    >
      <main className="tabs-shell">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
