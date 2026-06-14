import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, CreditCard, Rocket, Activity, AlertCircle } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";

export const dynamic = "force-dynamic";

function Sparkline({ data, color, id }: { data: number[], color: string, id: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `${points} 100,100 0,100`;

  return (
    <svg width="100%" height="48px" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
        <line x1="0" y1="25" x2="100" y2="25" />
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="0" y1="75" x2="100" y2="75" />
        {data.map((_, i) => {
          const x = (i / (data.length - 1)) * 100;
          return <line key={i} x1={x} y1="0" x2={x} y2="100" />;
        })}
      </g>

      <polygon
        fill={`url(#grad-${id})`}
        points={areaPoints}
        style={{
          animation: 'fadeInArea 1s ease-out forwards',
          opacity: 0
        }}
      />
      <polyline 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        points={points} 
        style={{
          strokeDasharray: '300',
          strokeDashoffset: '300',
          animation: 'drawSparkline 1s ease-out forwards'
        }}
      />
      <style>{`
        @keyframes drawSparkline { to { stroke-dashoffset: 0; } }
        @keyframes fadeInArea { to { opacity: 1; } }
      `}</style>
    </svg>
  );
}

function getTrendPct(data: number[]) {
  if (data.length < 2) return "+0%";
  const first = data[0];
  const last = data[data.length - 1];
  if (first === 0) return last > 0 ? "+100%" : "0%";
  const pct = Math.round(((last - first) / first) * 100);
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

export default async function Dashboard(props: any) {
  const searchParams = await Promise.resolve(props.searchParams);
  const filterStatus = searchParams?.status as string | undefined;
  const customerCount = await prisma.customer.count();
  const orderCount = await prisma.order.count();
  const campaignCount = await prisma.campaign.count();

  const statuses = await prisma.communication.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const funnelMap: Record<string, number> = {
    SENT: 0, DELIVERED: 0, OPENED: 0, CLICKED: 0, FAILED: 0
  };

  statuses.forEach(s => {
    funnelMap[s.status] = s._count.status;
  });

  const totalComms = funnelMap.SENT + funnelMap.DELIVERED + funnelMap.OPENED + funnelMap.CLICKED + funnelMap.FAILED;
  
  // Calculate relative widths for proportional funnel
  const getWidth = (val: number) => totalComms === 0 ? 0 : Math.max((val / totalComms) * 100, 2);

  const recentActivities = await prisma.communication.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    where: filterStatus ? { status: filterStatus.toUpperCase() } : undefined,
    include: {
      customer: { select: { name: true } },
      campaign: { select: { name: true } }
    }
  });

  return (
    <div className="flex-col gap-8">
      <div className="flex justify-between items-center" style={{ height: '80px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>Good morning, Ankur 👋</h1>
          <p className="text-secondary mt-2">Here's what's happening with your campaigns today.</p>
        </div>
        <Link href="/campaigns/new">
          <button className="btn-primary flex items-center gap-2" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 500, boxShadow: '0 0 10px rgba(124,58,237,0.3)' }}>
            <Rocket size={16} /> Launch Campaign
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(to top, rgba(124,58,237,0.06), transparent)', position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px' }} />
          <div className="flex items-center gap-3 mb-2" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <Users size={16} />
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>Total Shoppers</div>
          </div>
          <div style={{ fontSize: '42px', color: 'var(--text-primary)', lineHeight: 1, position: 'relative', zIndex: 1 }}>
            <AnimatedCounter value={customerCount} />
          </div>
          <div style={{ marginTop: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
            <Sparkline id="customers" data={[10, 15, 20, 18, 25, 22, 30]} color="var(--accent-primary)" />
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '8px' }}>{getTrendPct([10, 15, 20, 18, 25, 22, 30])} vs last week</div>
          </div>
        </div>

        <div className="card" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(to top, rgba(6,182,212,0.06), transparent)', position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px' }} />
          <div className="flex items-center gap-3 mb-2" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <CreditCard size={16} />
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</div>
          </div>
          <div style={{ fontSize: '42px', color: 'var(--text-primary)', lineHeight: 1, position: 'relative', zIndex: 1 }}>
            <AnimatedCounter value={orderCount} />
          </div>
          <div style={{ marginTop: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
            <Sparkline id="orders" data={[50, 45, 60, 55, 70, 68, 85]} color="var(--accent-cyan)" />
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '8px' }}>{getTrendPct([50, 45, 60, 55, 70, 68, 85])} vs last week</div>
          </div>
        </div>

        <div className="card" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(to top, rgba(16,185,129,0.06), transparent)', position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px' }} />
          <div className="flex items-center gap-3 mb-2" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <Activity size={16} />
            </div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>Campaigns</div>
          </div>
          <div style={{ fontSize: '42px', color: 'var(--text-primary)', lineHeight: 1, position: 'relative', zIndex: 1 }}>
            <AnimatedCounter value={campaignCount} />
          </div>
          <div style={{ marginTop: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
            <Sparkline id="campaigns" data={[2, 2, 3, 3, 5, 5, 8]} color="var(--accent-emerald)" />
            <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', marginTop: '8px' }}>{getTrendPct([2, 2, 3, 3, 5, 5, 8])} vs last week</div>
          </div>
        </div>
      </div>

      {/* Communication Funnel & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card flex-col gap-6" style={{ borderTop: '2px solid rgba(124,58,237,0.4)' }}>
          <h2 style={{ fontSize: '18px' }}>Communication Funnel</h2>
          
          {totalComms === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l18-5v12L3 14v-3z"></path>
                  <path d="M11.6 16.8a3 3 0 11-5.8-1.6"></path>
                </svg>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>No campaigns sent yet</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Launch a campaign to see delivery data</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', width: '100%', height: '56px', alignItems: 'center', gap: '8px' }}>
                {funnelMap.SENT >= 0 && (
                  <React.Fragment>
                    <Link href={filterStatus === 'SENT' ? '/' : '/?status=SENT'} scroll={false} style={{ flex: funnelMap.SENT || 1, height: '100%', display: 'block' }}>
                      <div style={{ 
                        width: '100%', height: '100%', background: 'var(--accent-cyan)', 
                        clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)', borderRadius: '2px',
                        opacity: filterStatus && filterStatus !== 'SENT' ? 0.3 : 1, transition: 'opacity 0.2s ease' 
                      }} title="Sent" />
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>›</span>
                  </React.Fragment>
                )}
                {funnelMap.DELIVERED >= 0 && (
                  <React.Fragment>
                    <Link href={filterStatus === 'DELIVERED' ? '/' : '/?status=DELIVERED'} scroll={false} style={{ flex: funnelMap.DELIVERED || 1, height: '100%', display: 'block' }}>
                      <div style={{ 
                        width: '100%', height: '100%', background: 'var(--accent-emerald)', 
                        clipPath: 'polygon(0 10%, 100% 20%, 100% 80%, 0 90%)', borderRadius: '2px',
                        opacity: filterStatus && filterStatus !== 'DELIVERED' ? 0.3 : 1, transition: 'opacity 0.2s ease'
                      }} title="Delivered" />
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>›</span>
                  </React.Fragment>
                )}
                {funnelMap.OPENED >= 0 && (
                  <React.Fragment>
                    <Link href={filterStatus === 'OPENED' ? '/' : '/?status=OPENED'} scroll={false} style={{ flex: funnelMap.OPENED || 1, height: '100%', display: 'block' }}>
                      <div style={{ 
                        width: '100%', height: '100%', background: 'var(--accent-amber)', 
                        clipPath: 'polygon(0 20%, 100% 30%, 100% 70%, 0 80%)', borderRadius: '2px',
                        opacity: filterStatus && filterStatus !== 'OPENED' ? 0.3 : 1, transition: 'opacity 0.2s ease'
                      }} title="Opened" />
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>›</span>
                  </React.Fragment>
                )}
                {funnelMap.CLICKED >= 0 && (
                  <React.Fragment>
                    <Link href={filterStatus === 'CLICKED' ? '/' : '/?status=CLICKED'} scroll={false} style={{ flex: funnelMap.CLICKED || 1, height: '100%', display: 'block' }}>
                      <div style={{ 
                        width: '100%', height: '100%', background: 'var(--accent-indigo)', 
                        clipPath: 'polygon(0 30%, 100% 40%, 100% 60%, 0 70%)', borderRadius: '2px',
                        opacity: filterStatus && filterStatus !== 'CLICKED' ? 0.3 : 1, transition: 'opacity 0.2s ease'
                      }} title="Clicked" />
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>›</span>
                  </React.Fragment>
                )}
                {funnelMap.FAILED >= 0 && (
                  <React.Fragment>
                    <Link href={filterStatus === 'FAILED' ? '/' : '/?status=FAILED'} scroll={false} style={{ flex: funnelMap.FAILED || 1, height: '100%', display: 'block' }}>
                      <div style={{ 
                        width: '100%', height: '100%', background: 'var(--accent-rose)', 
                        clipPath: 'polygon(0 40%, 100% 50%, 100% 50%, 0 60%)', borderRadius: '2px',
                        opacity: filterStatus && filterStatus !== 'FAILED' ? 0.3 : 1, transition: 'opacity 0.2s ease'
                      }} title="Failed" />
                    </Link>
                  </React.Fragment>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <FunnelStat label="Sent" count={funnelMap.SENT} total={totalComms} color="var(--accent-cyan)" status="SENT" currentFilter={filterStatus} />
                <FunnelStat label="Delivered" count={funnelMap.DELIVERED} total={totalComms} color="var(--accent-emerald)" status="DELIVERED" currentFilter={filterStatus} />
                <FunnelStat label="Opened" count={funnelMap.OPENED} total={totalComms} color="var(--accent-amber)" status="OPENED" currentFilter={filterStatus} />
                <FunnelStat label="Clicked" count={funnelMap.CLICKED} total={totalComms} color="var(--accent-indigo)" status="CLICKED" currentFilter={filterStatus} />
                <FunnelStat label="Failed" count={funnelMap.FAILED} total={totalComms} color="var(--accent-rose)" status="FAILED" currentFilter={filterStatus} />
              </div>
            </div>
          )}
        </div>

        <div className="card flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 style={{ fontSize: '18px' }}>Live activity</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
          <div className="flex-col gap-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelStat({ label, count, total, color, status, currentFilter }: { label: string, count: number, total: number, color: string, status: string, currentFilter?: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  const isActive = currentFilter === status;
  const href = isActive ? '/' : `/?status=${status}`;

  return (
    <Link href={href} scroll={false} style={{ textDecoration: 'none' }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        background: isActive ? `color-mix(in srgb, ${color} 25%, transparent)` : `color-mix(in srgb, ${color} 12%, transparent)`, 
        border: `1px solid color-mix(in srgb, ${color} ${isActive ? '50%' : '20%'}, transparent)`, 
        borderRadius: '20px', padding: '6px 14px',
        transition: 'all 0.2s ease', cursor: 'pointer',
        boxShadow: isActive ? `0 0 12px color-mix(in srgb, ${color} 30%, transparent)` : 'none'
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
        <div style={{ fontSize: '13px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {label} 
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
          <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
        </div>
      </div>
    </Link>
  );
}

import React from "react";

// Separate client component to auto-refresh recent activity
import ActivityFeed from "./ActivityFeed";
