import type { Viewport } from "next";
import { AppAccessGate } from "@/components/stark/AppAccessGate";

export const viewport: Viewport = {
  interactiveWidget: "overlays-content",
};

export default function AccessEntryPage() {
  return <AppAccessGate />;
}
