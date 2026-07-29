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