import type { CSSProperties } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton ${className}`.trim()} style={style} aria-hidden="true" />;
}

export function PageSkeleton({ title, cards = 3 }: { title: string; cards?: number }) {
  return (
    <div className="page-stack" aria-busy="true">
      <PageTopBar title={title} />
      <Skeleton className="skeleton-page-hero" />
      {Array.from({ length: cards }).map((_, index) => (
        <Skeleton key={index} className="skeleton-card" />
      ))}
    </div>
  );
}

export function TabsTransitionSkeleton() {
  return (
    <div className="page-stack tabs-transition-skeleton" aria-busy="true">
      <Skeleton className="skeleton-page-hero" />
      <div className="progress-grid">
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
      <div className="summary-grid">
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
      <Skeleton className="skeleton-card" />
      <div className="home-main-grid">
        <Skeleton className="skeleton-card" />
        <Skeleton className="skeleton-card" />
      </div>
    </div>
  );
}
