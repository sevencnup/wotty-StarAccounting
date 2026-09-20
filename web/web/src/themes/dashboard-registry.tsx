import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DashboardData } from "@/types";
import type { ThemeId } from "@/themes/registry";
import { DashboardLoadingShell } from "@/features/dashboard/components/themes/DashboardLoadingShell";
import { AnalyticsLoadingShell } from "@/features/dashboard/components/themes/AnalyticsLoadingShell";
import { OrangePurpleLoadingShell } from "@/features/dashboard/components/themes/OrangePurpleLoadingShell";
import { DustyBlueLoadingShell } from "@/features/dashboard/components/themes/DustyBlueLoadingShell";
import { VibrantLoadingShell } from "@/features/dashboard/components/themes/VibrantLoadingShell";
import { CharmingPurpleLoadingShell } from "@/features/dashboard/components/themes/CharmingPurpleLoadingShell";
import { WhiteGridLoadingShell } from "@/features/dashboard/components/themes/WhiteGridLoadingShell";
import { getThemeManifest, type DashboardVariantId } from "@/themes/theme-manifest";
import { getDashboardEntryFileNameForTheme } from "@/themes/dashboard-routes";

export type DashboardThemeProps = {
  data: DashboardData;
  loading?: boolean;
  refreshing?: boolean;
  dateFilter?: "month" | "all" | "custom";
  onDateFilterChange?: (filter: "month" | "all" | "custom") => void;
  customPeriod?: {
    mode: "year" | "month";
    year: string;
    month: string;
  };
  onCustomPeriodChange?: (period: {
    mode: "year" | "month";
    year: string;
    month: string;
  }) => void;
  dateRangeLabel?: string;
  comparisonLabel?: string;
  platform?: string;
  onPlatformChange?: (value: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
};

type DashboardThemeComponent = any;

const DASHBOARD_THEME_LOADERS = {
  default: () => import("@/features/dashboard/components/themes/DefaultDashboard"),
  analytics: () => import("@/features/dashboard/components/themes/AnalyticsDashboard"),
  "orange-purple": () => import("@/features/dashboard/components/themes/OrangePurpleDashboard"),
  "dusty-blue": () => import("@/features/dashboard/components/themes/DustyBlueDashboard"),
  vibrant: () => import("@/features/dashboard/components/themes/VibrantDashboard"),
  "charming-purple": () => import("@/features/dashboard/components/themes/CharmingPurpleDashboard"),
  "white-grid": () => import("@/features/dashboard/components/themes/WhiteGridDashboard"),
} satisfies Record<DashboardVariantId, () => Promise<Record<string, unknown>>>;

const DASHBOARD_COMPONENTS: Record<DashboardVariantId, DashboardThemeComponent> = {
  default: dynamic(
    () => DASHBOARD_THEME_LOADERS.default().then((mod) => mod.DashboardDefaultTheme),
    {
      ssr: false,
      loading: () => <DashboardLoadingShell />,
    },
  ),
  analytics: dynamic(
    () => DASHBOARD_THEME_LOADERS.analytics().then((mod) => mod.AnalyticsDashboard),
    {
      ssr: false,
      loading: () => <AnalyticsLoadingShell />,
    },
  ),
  "orange-purple": dynamic(
    () => DASHBOARD_THEME_LOADERS["orange-purple"]().then((mod) => mod.OrangePurpleDashboard),
    {
      ssr: false,
      loading: () => <OrangePurpleLoadingShell />,
    },
  ),
  "dusty-blue": dynamic(
    () => DASHBOARD_THEME_LOADERS["dusty-blue"]().then((mod) => mod.DustyBlueDashboard),
    {
      ssr: false,
      loading: () => <DustyBlueLoadingShell />,
    },
  ),
  vibrant: dynamic(
    () => DASHBOARD_THEME_LOADERS.vibrant().then((mod) => mod.VibrantDashboard),
    {
      ssr: false,
      loading: () => <VibrantLoadingShell />,
    },
  ),
  "charming-purple": dynamic(
    () => DASHBOARD_THEME_LOADERS["charming-purple"]().then((mod) => mod.CharmingPurpleDashboard),
    {
      ssr: false,
      loading: () => <CharmingPurpleLoadingShell />,
    },
  ),
  "white-grid": dynamic(
    () => DASHBOARD_THEME_LOADERS["white-grid"]().then((mod) => mod.WhiteGridDashboard),
    {
      ssr: false,
      loading: () => <WhiteGridLoadingShell />,
    },
  ),
};

export function getDashboardThemeComponent(themeId: ThemeId) {
  return DASHBOARD_COMPONENTS[getThemeManifest(themeId).dashboardVariant];
}

export function getDashboardEntryFileName(themeId: ThemeId) {
  return getDashboardEntryFileNameForTheme(themeId);
}

export function preloadDashboardThemeComponent(themeId: ThemeId) {
  const variant = getThemeManifest(themeId).dashboardVariant;
  void DASHBOARD_THEME_LOADERS[variant]();
}
