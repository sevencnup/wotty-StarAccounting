import { AppAccessGate } from "@/components/stark/AppAccessGate";
import { ShowcaseEntryRedirect } from "@/components/stark/ShowcaseEntryRedirect";
import { SHOWCASE_DEMO_MODE } from "@/lib/stark/runtime";

export default function AccessEntryPage() {
  if (SHOWCASE_DEMO_MODE) return <ShowcaseEntryRedirect />;
  return <AppAccessGate />;
}
