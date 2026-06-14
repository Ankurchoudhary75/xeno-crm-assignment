"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function timeAgo(dateInput: Date | string) {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed({
  activities,
}: {
  activities: {
    id: string;
    status: string;
    updatedAt: Date;
    createdAt?: Date;
    customer: { name: string };
    campaign: { name: string };
  }[];
}) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);

  if (activities.length === 0) {
    return (
      <div
        style={{
          color: "var(--text-muted)",
          fontSize: "13px",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        No activity yet.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SENT":
        return "var(--accent-cyan)";
      case "DELIVERED":
        return "var(--accent-emerald)";
      case "OPENED":
        return "var(--accent-amber)";
      case "CLICKED":
        return "var(--accent-indigo)";
      case "FAILED":
        return "var(--accent-rose)";
      default:
        return "var(--accent-primary)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {activities.map((act) => {
        const color = getStatusColor(act.status);
        return (
          <div
            key={act.id}
            className="flex items-center justify-between"
            style={{
              animation: "pageEnter 300ms ease-out forwards",
              padding: "10px 14px",
              borderLeft: `3px solid ${color}`,
              background: "transparent",
              transition: "background 0.2s",
              cursor: "default",
              borderRadius: "0 8px 8px 0",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-elevated)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {act.customer.name}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {act.campaign.name}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div
                style={{
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "0 10px",
                  borderRadius: "20px",
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color: color,
                  border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                }}
              >
                {act.status}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {timeAgo(act.updatedAt || act.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
