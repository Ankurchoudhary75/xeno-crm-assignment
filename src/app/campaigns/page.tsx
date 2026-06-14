import prisma from "@/lib/prisma";
import Link from "next/link";
import { Search, Filter, Plus, Users, MessageCircle, MessageSquare, Mail, Smartphone, Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      segment: true,
      _count: { select: { communications: true } },
      communications: {
        select: { status: true }
      }
    }
  });

  const runningCount = campaigns.filter(c => {
    const hasPending = c.communications.some(comm => comm.status === 'PENDING' || comm.status === 'SENT' || comm.status === 'DELIVERED');
    return hasPending && c.communications.length > 0;
  }).length;

  return (
    <div className="flex-col gap-8">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 style={{ fontSize: '24px', letterSpacing: '-0.02em', background: 'none', WebkitTextFillColor: 'var(--text-primary)' }}>Campaigns</h1>
          {runningCount > 0 && (
            <div style={{
              background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '4px 12px',
              borderRadius: '9999px', fontSize: '12px', fontWeight: 600, border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'pulse 1.5s infinite' }} />
              {runningCount} running
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search campaigns..." style={{ paddingLeft: '32px', height: '36px', background: 'var(--bg-elevated)' }} />
          </div>
          <button className="btn-secondary flex items-center gap-2" style={{ height: '36px', padding: '0 16px' }}>
            <Filter size={14} /> Filter
          </button>
          <Link href="/campaigns/new">
            <button className="btn-primary flex items-center gap-2" style={{ height: '36px', padding: '0 16px' }}>
              <Plus size={16} /> New Campaign
            </button>
          </Link>
        </div>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="card flex-col items-center justify-center gap-4 py-12" style={{ opacity: 0.6 }}>
          <Rocket size={48} color="var(--text-muted)" />
          <p>No campaigns found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {campaigns.map(camp => {
            const total = camp.communications.length;
            const statusCount = { SENT: 0, DELIVERED: 0, OPENED: 0, CLICKED: 0, FAILED: 0 };
            camp.communications.forEach(c => { statusCount[c.status as keyof typeof statusCount]++; });

            const isRunning = camp.communications.some(c => c.status === 'PENDING' || c.status === 'SENT' || c.status === 'DELIVERED') && total > 0;
            const campStatusText = isRunning ? "RUNNING" : "COMPLETED";
            const getPct = (count: number) => total === 0 ? 0 : Math.round((count / total) * 100);

            const channelIcon = camp.channel === 'WHATSAPP' ? <MessageCircle size={16} color="var(--accent-emerald)" /> :
                                camp.channel === 'SMS' ? <MessageSquare size={16} color="var(--accent-amber)" /> :
                                camp.channel === 'EMAIL' ? <Mail size={16} color="var(--accent-cyan)" /> :
                                <Smartphone size={16} color="var(--accent-primary)" />;

            return (
              <div key={camp.id} className="card flex-col gap-4" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{camp.name}</h3>
                    <div className="flex items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                      <Users size={14} /> {total} Audience
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {channelIcon}
                    </div>
                    <div style={{
                      fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', padding: '4px 8px', borderRadius: '12px',
                      background: isRunning ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      color: isRunning ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                    }}>
                      {campStatusText}
                    </div>
                  </div>
                </div>

                {/* Progress Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
                  <StatChip label="Delivered" pct={getPct(statusCount.DELIVERED)} color="var(--accent-emerald)" />
                  <StatChip label="Opened" pct={getPct(statusCount.OPENED)} color="var(--accent-amber)" />
                  <StatChip label="Clicked" pct={getPct(statusCount.CLICKED)} color="var(--accent-indigo)" />
                  <StatChip label="Failed" pct={getPct(statusCount.FAILED)} color="var(--accent-rose)" />
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', display: 'flex', marginTop: '8px', position: 'relative' }}>
                  {isRunning && (
                    <div className="skeleton" style={{ position: 'absolute', inset: 0, opacity: 0.2 }} />
                  )}
                  {statusCount.DELIVERED > 0 && <div style={{ width: `${(statusCount.DELIVERED/total)*100}%`, background: 'var(--accent-emerald)' }} />}
                  {statusCount.OPENED > 0 && <div style={{ width: `${(statusCount.OPENED/total)*100}%`, background: 'var(--accent-amber)' }} />}
                  {statusCount.CLICKED > 0 && <div style={{ width: `${(statusCount.CLICKED/total)*100}%`, background: 'var(--accent-indigo)' }} />}
                  {statusCount.FAILED > 0 && <div style={{ width: `${(statusCount.FAILED/total)*100}%`, background: 'var(--accent-rose)' }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, pct, color }: { label: string, pct: number, color: string }) {
  return (
    <div style={{ background: 'var(--bg-subtle)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</div>
    </div>
  );
}
