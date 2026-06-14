"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Rocket, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Audience", href: "/audience", icon: <Users size={20} /> },
    { name: "Campaigns", href: "/campaigns", icon: <Rocket size={20} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#080B14',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0
    }}>
      {/* Logo Area */}
      <div style={{ height: '72px', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'pulse 3s infinite' }}>
          <defs>
            <linearGradient id="hex-grad" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-cyan)" />
            </linearGradient>
            <style>
              {`@keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
              }`}
            </style>
          </defs>
          <path d="M12 2L22 7.77V16.22L12 22L2 16.22V7.77L12 2Z" fill="url(#hex-grad)" />
        </svg>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>XenoCRM</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>AI Marketing Suite</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                height: '44px',
                borderRadius: '10px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.04) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #7C3AED' : '3px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              >
                <div style={{ color: isActive ? '#A855F7' : 'inherit', display: 'flex' }}>
                  {item.icon}
                </div>
                <span style={{ fontWeight: 500, fontSize: '14px', flex: 1 }}>{item.name}</span>
                {item.name === "Campaigns" && (
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)',
                    boxShadow: '0 0 8px var(--accent-glow)', animation: 'pulse 2s infinite'
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Avatar Card */}
      <div style={{ marginTop: 'auto', padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ 
          background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.04)', 
          borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' 
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '8px', 
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'white', fontWeight: 600, fontSize: '14px'
            }}>
              AC
            </div>
            <div style={{ 
              position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px',
              borderRadius: '50%', background: 'var(--accent-emerald)', border: '2px solid #080B14'
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ankur C.</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Marketing Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
