import type { CSSProperties } from "react";
import Link from "next/link";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { getCloudApiUrl, getCurrentDataMode } from "@/lib/stark/storage/local-config";

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

export function PageDataError({ title, onRetry }: { title: string; onRetry?: () => void }) {
  const isCloud = getCurrentDataMode() === "CLOUD";
  return (
    <div className="page-stack">
      <PageTopBar title={title} />
      <section className="home-data-error" role="alert">
        <strong>{isCloud ? "未能读取数据库数据" : "未能读取本地数据"}</strong>
        <p>{isCloud ? "请检查后端服务和数据库连接后重试。" : "请重试或检查浏览器的本地存储权限。"}</p>
        {isCloud ? <code>{getCloudApiUrl()}</code> : null}
        <div className="home-data-error-actions">
          {onRetry ? <button type="button" onClick={onRetry}>重新加载</button> : null}
          <Link href="/app/accounts">检查数据源设置</Link>
        </div>
      </section>
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
