import { notFound } from "next/navigation";
import { DashboardPageShell } from "@/features/dashboard/components/DashboardPageShell";
import { DASHBOARD_ROUTE_SEGMENTS, isDashboardRouteSegment } from "@/themes/dashboard-routes";

type DashboardEntryPageProps = {
  params: Promise<{
    dashboardEntry: string;
  }>;
};

export function generateStaticParams() {
  return DASHBOARD_ROUTE_SEGMENTS.map((dashboardEntry) => ({
    dashboardEntry,
  }));
}

export default async function DashboardEntryPage({ params }: DashboardEntryPageProps) {
  const { dashboardEntry } = await params;

  if (!isDashboardRouteSegment(dashboardEntry)) {
    notFound();
  }

  return <DashboardPageShell />;
}
