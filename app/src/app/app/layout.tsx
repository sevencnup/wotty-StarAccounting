import { ProtectedProductRoute } from "@/components/stark/ProtectedProductRoute";

export default function ProductAppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedProductRoute>{children}</ProtectedProductRoute>;
}
