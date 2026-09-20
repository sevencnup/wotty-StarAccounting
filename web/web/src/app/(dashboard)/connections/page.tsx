"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  KeyRound,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Trash2,
  Waypoints,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/shared/PageContainer";
import { Skeleton } from "@/components/shared/Skeletons";
import { DelayedRender } from "@/components/shared/DelayedRender";

type GenerateData = {
  connectionId: string;
  otpCode: string;
  publicIp: string;
  verifyPath: string;
  expiresAt: string;
  expiresInSeconds: number;
};

type Device = {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  ipAddress: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

function formatSeconds(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ConnectionsPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);
  const [generateData, setGenerateData] = useState<GenerateData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const remainingSeconds = useMemo(() => {
    if (!generateData) return 0;
    return (new Date(generateData.expiresAt).getTime() - now) / 1000;
  }, [generateData, now]);

  const expired = Boolean(generateData) && remainingSeconds <= 0;

  const currentConnectionDevice = useMemo(() => {
    if (!generateData) return null;
    return devices.find((device) => device.id === generateData.connectionId) ?? null;
  }, [devices, generateData]);

  const connectionStatus = useMemo(() => {
    if (currentConnectionDevice?.verifiedAt) {
      return {
        title: "已完成绑定",
        detail: `${currentConnectionDevice.deviceName ?? "新设备"} 已通过验证码完成授权。`,
        tone: "emerald",
      };
    }

    if (generateData && !expired) {
      return {
        title: "等待 APP 验证",
        detail: "请在 App 中输入服务器地址和当前验证码完成绑定。",
        tone: "blue",
      };
    }

    if (generateData && expired) {
      return {
        title: "验证码已过期",
        detail: "旧验证码已失效，请重新生成新的连接码。",
        tone: "amber",
      };
    }

    return {
      title: "尚未生成连接码",
      detail: "生成验证码后，App 才能发起第一次设备绑定。",
      tone: "slate",
    };
  }, [currentConnectionDevice, expired, generateData]);

  const verifyPayload = useMemo(
    () =>
      JSON.stringify(
        {
          otpCode: generateData?.otpCode ?? "123456",
          deviceId: "your-device-id",
          deviceName: "iPhone 15",
        },
        null,
        2
      ),
    [generateData]
  );

  useEffect(() => {
    async function loadPage() {
      try {
        await loadDevices();
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadPage();
  }, []);

  useEffect(() => {
    if (!generateData) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [generateData]);

  useEffect(() => {
    if (!generateData || expired || currentConnectionDevice?.verifiedAt) return;

    const timer = window.setInterval(() => {
      void loadDevices(true);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [currentConnectionDevice?.verifiedAt, expired, generateData]);

  async function loadDevices(silent = false) {
    if (!silent) {
      setIsRefreshingDevices(true);
    }

    try {
      const data = await apiFetch<{ devices: Device[] }>("/api/connect/devices");
      setDevices(data.devices);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "加载已授权设备失败");
      }
    } finally {
      if (!silent) {
        setIsRefreshingDevices(false);
      }
    }
  }

  async function generateOtp() {
    setError(null);
    setIsGenerating(true);

    try {
      const data = await apiFetch<GenerateData>("/api/connect/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      setGenerateData(data);
      setNow(Date.now());
      await loadDevices(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成连接码失败");
    } finally {
      setIsGenerating(false);
    }
  }

  async function revokeDevice(id: string) {
    setError(null);

    try {
      await apiFetch<{ revoked: boolean }>(`/api/connect/${id}`, { method: "DELETE" });
      if (generateData?.connectionId === id) {
        setGenerateData(null);
      }
      await loadDevices(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "撤销授权失败");
    }
  }

  async function copyValue(field: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 1600);
    } catch {
      setError("复制失败，请手动复制");
    }
  }

  if (isPageLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <section className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-3">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-8 w-full max-w-md rounded-[14px]" />
              <Skeleton className="h-4 w-full max-w-xl rounded-full opacity-60" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="rounded-[18px] border border-slate-200 p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3.5 w-16 rounded-full opacity-60" />
                    <Skeleton className="h-7 w-24 rounded-[12px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-6">
          <div className="space-y-3">
            <Skeleton className="h-3.5 w-20 rounded-full opacity-60" />
            <Skeleton className="h-10 w-32 rounded-[14px]" />
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-[18px]" />
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  /* ────────── Sub-components ────────── */
  const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white p-3 sm:p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );

  const CardHeader = ({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) => (
    <div className="mb-3 sm:mb-6 flex items-center justify-between gap-2">
      <div>
        {eyebrow && <p className="text-[10px] sm:text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">{eyebrow}</p>}
        <h3 className="text-[13px] sm:text-[15px] font-bold text-[#1e293b]">{title}</h3>
      </div>
      {action}
    </div>
  );

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    valueClassName,
    actionLabel,
    onAction,
    disabled = false,
  }: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    valueClassName?: string;
    actionLabel?: string;
    onAction?: () => void;
    disabled?: boolean;
  }) => (
    <div className="rounded-[12px] border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className={cn("mt-0.5 break-all text-[12px] sm:text-sm font-semibold tracking-tight text-slate-950", valueClassName)}>
              {value}
            </p>
          </div>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <PageContainer maxWidth="5xl">
      {/* ═══════ Hero Section ═══════ */}
      <section
        className="relative overflow-hidden rounded-[16px] p-3 sm:rounded-[20px] sm:p-4"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid rgba(43, 106, 242, 0.12)",
        }}
      >
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(43,106,242,0.12),transparent_60%)] lg:block" />

        <div className="relative grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white/85 px-2.5 py-1 text-[10px] sm:text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#2B6AF2]" />
              Connection
            </div>
            <h1 className="text-[13px] sm:text-[15px] font-semibold tracking-tight text-[#1e293b]">
              Web + App 连接管理
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Card className={cn(
              "p-2.5",
              connectionStatus.tone === "emerald" && "bg-emerald-50 border-emerald-200",
              connectionStatus.tone === "amber" && "bg-amber-50 border-amber-200",
              connectionStatus.tone === "blue" && "bg-blue-50 border-blue-200",
              connectionStatus.tone === "slate" && "bg-slate-50 border-slate-200"
            )}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">状态</p>
              <p className={cn(
                "mt-0.5 text-[13px] sm:text-sm font-bold tracking-tight",
                connectionStatus.tone === "emerald" && "text-emerald-600",
                connectionStatus.tone === "amber" && "text-amber-600",
                connectionStatus.tone === "blue" && "text-[#2B6AF2]",
                connectionStatus.tone === "slate" && "text-[#1e293b]"
              )}>
                {connectionStatus.title}
              </p>
            </Card>
            <Card className="bg-[#D8E6FC] p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748b]">设备</p>
              <p className="mt-0.5 text-[13px] sm:text-sm font-bold tracking-tight text-[#1e293b]">{devices.length} 台</p>
            </Card>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      ) : null}

      {/* ═══════ OTP Section ═══════ */}
      <DelayedRender delay={0}>
        <Card>
          <CardHeader
            title="生成连接码"
            eyebrow="Web 端"
            action={
              <button
                type="button"
                onClick={generateOtp}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2B6AF2] px-3 py-1.5 text-[11px] sm:text-xs font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <KeyRound className="h-3 w-3" />}
                {isGenerating ? "生成中" : generateData && !expired ? "重新生成" : "生成连接码"}
              </button>
            }
          />

          <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-2.5 md:grid-cols-2">
              {/* OTP Display */}
              <div className="rounded-[16px] border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-blue-700/80">验证码</p>
                    <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#1e293b] font-numbers">
                      {generateData?.otpCode ?? "------"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => generateData && copyValue("otp", generateData.otpCode)}
                    disabled={!generateData}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedField === "otp" ? "已复制" : "复制"}
                  </button>
                </div>
              </div>

              {/* Info Cards */}
              <InfoCard
                icon={Server}
                label="服务器地址"
                value={generateData?.publicIp ?? "等待生成"}
                actionLabel={copiedField === "host" ? "已复制" : "复制"}
                onAction={() => generateData && copyValue("host", generateData.publicIp)}
                disabled={!generateData}
              />

              <InfoCard
                icon={Waypoints}
                label="验证路径"
                value={generateData?.verifyPath ?? "/api/connect/verify"}
                actionLabel={copiedField === "path" ? "已复制" : "复制"}
                onAction={() => copyValue("path", generateData?.verifyPath ?? "/api/connect/verify")}
              />

              <InfoCard
                icon={KeyRound}
                label="剩余时间"
                value={generateData ? (expired ? "已过期" : formatSeconds(remainingSeconds)) : "05:00"}
                valueClassName={expired ? "text-amber-600" : undefined}
              />

              <InfoCard
                icon={ShieldCheck}
                label="绑定状态"
                value={connectionStatus.title}
                valueClassName={currentConnectionDevice?.verifiedAt ? "text-emerald-600" : undefined}
              />
            </div>

            {/* App Summary */}
            <div
              className="rounded-[16px] border border-slate-200 p-3 text-white shadow-sm"
              style={{ background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)" }}
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Smartphone className="h-3.5 w-3.5 text-cyan-300" />
                App 对接摘要
              </div>

              <div className="mt-2.5 space-y-2 text-xs text-slate-300">
                <div className="rounded-[12px] border border-white/10 bg-white/5 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">请求方式</p>
                  <p className="mt-1 font-mono text-[11px] text-white">POST /api/connect/verify</p>
                </div>

                <div className="rounded-[12px] border border-white/10 bg-white/5 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">请求体</p>
                  <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-[1.4] text-slate-100">
                    {verifyPayload}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {currentConnectionDevice?.verifiedAt ? (
            <div className="mt-3 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-700">
              连接完成 · {currentConnectionDevice.deviceName ?? "未命名设备"} · {formatDateTime(currentConnectionDevice.verifiedAt)}
            </div>
          ) : null}
        </Card>
      </DelayedRender>

      {/* ═══════ Device Table ═══════ */}
      <DelayedRender delay={60}>
        <Card>
          <CardHeader
            title="已授权设备"
            eyebrow="设备管理"
            action={
              <button
                type="button"
                onClick={() => void loadDevices()}
                disabled={isRefreshingDevices}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={cn("h-3 w-3", isRefreshingDevices && "animate-spin")} />
                刷新
              </button>
            }
          />

          {devices.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[11px] sm:text-xs text-slate-500">
              还没有已授权设备
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[16px] border border-slate-200">
              <table className="w-full min-w-[600px] text-[11px] sm:text-xs">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">设备</th>
                    <th className="px-3 py-2 font-medium">设备 ID</th>
                    <th className="px-3 py-2 font-medium">IP 地址</th>
                    <th className="px-3 py-2 font-medium">绑定时间</th>
                    <th className="px-3 py-2 font-medium">状态</th>
                    <th className="px-3 py-2 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => {
                    const isCurrentConnection = generateData?.connectionId === device.id;

                    return (
                      <tr key={device.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                        <td className="px-3 py-2">
                          <div className="font-medium text-[#1e293b]">{device.deviceName ?? "未命名设备"}</div>
                          <div className="text-[10px] text-[#64748b]">ID: {device.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">{device.deviceId ?? "-"}</td>
                        <td className="px-3 py-2 text-slate-600">{device.ipAddress ?? "-"}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDateTime(device.verifiedAt)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                              isCurrentConnection ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            )}
                          >
                            {isCurrentConnection ? "当前" : "已授权"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => revokeDevice(device.id)}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            撤销
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </DelayedRender>
    </PageContainer>
  );
}
