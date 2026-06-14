import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function CampaignDetails({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      segment: true,
      communications: {
        include: { customer: true }
      }
    }
  });

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const stats = { PENDING: 0, SENT: 0, DELIVERED: 0, OPENED: 0, CLICKED: 0, FAILED: 0 };
  campaign.communications.forEach(c => {
    if (c.status in stats) stats[c.status as keyof typeof stats]++;
  });

  return (
    <div className="animate-fade-in">
      <Link href="/campaigns" className="text-secondary mb-4 inline-block">&larr; Back to Campaigns</Link>
      <h1 className="mb-2">{campaign.name}</h1>
      <p className="text-secondary mb-8">Detailed performance metrics for this campaign.</p>

      <div className="glass p-6 mb-8" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Funnel Performance</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', textAlign: 'center' }}>
          <div>
            <div className="badge badge-sent mb-4">Sent</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.SENT + stats.DELIVERED + stats.OPENED + stats.CLICKED}</div>
          </div>
          <div>
            <div className="badge badge-delivered mb-4">Delivered</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.DELIVERED + stats.OPENED + stats.CLICKED}</div>
          </div>
          <div>
            <div className="badge badge-opened mb-4">Opened</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.OPENED + stats.CLICKED}</div>
          </div>
          <div>
            <div className="badge badge-clicked mb-4">Clicked</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.CLICKED}</div>
          </div>
          <div>
            <div className="badge badge-failed mb-4">Failed</div>
            <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.FAILED}</div>
          </div>
        </div>
      </div>

      <div className="glass p-6" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Shopper Breakdown</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Shopper</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {campaign.communications.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{c.customer.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.customer.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(c.updatedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
