"use client";

import { useState, useEffect } from "react";
import { Sparkles, Database, Filter, Search, MoreHorizontal, User } from "lucide-react";

export default function AudiencePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [name, setName] = useState("");
  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    const res = await fetch("/api/segments");
    if (res.ok) setSegments(await res.json());
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/segments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !results) return;
    try {
      await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, prompt: results.criteria, sql: results.sql })
      });
      setName("");
      setResults(null);
      setPrompt("");
      fetchSegments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-col gap-6" style={{ height: 'calc(100vh - 128px)' }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 style={{ fontSize: '24px' }}>Audience Builder</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '40% 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Left Panel: Filter Builder */}
        <div className="card flex-col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Filter size={16} /> Segment Filters</h2>
              <span className="text-muted" style={{ fontSize: '12px' }}>AI-Powered</span>
            </div>
            
            <form onSubmit={handleGenerate} className="flex-col gap-4">
              <div style={{ position: 'relative' }}>
                <textarea 
                  rows={3} 
                  placeholder="Describe your audience (e.g. Customers who spent over $50 in last 30 days...)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={{ resize: 'none' }}
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading || !prompt}
                  style={{
                    position: 'absolute', bottom: '12px', right: '12px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-indigo))',
                    color: 'white', borderRadius: '6px', padding: '6px 12px',
                    fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                    opacity: loading || !prompt ? 0.5 : 1
                  }}
                >
                  <Sparkles size={12} /> {loading ? "Analyzing..." : "Preview Audience"}
                </button>
              </div>
            </form>
          </div>

          {results && (
            <div className="card-inner flex-col gap-4 page-transition">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Generated SQL Query</span>
                <Database size={14} color="var(--accent-cyan)" />
              </div>
              <code style={{ fontSize: '11px', color: 'var(--accent-emerald)', background: 'var(--bg-base)', padding: '8px', borderRadius: '4px', wordBreak: 'break-all' }}>
                {results.sql}
              </code>
              
              <div className="flex-col gap-2 mt-2">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Save this segment</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Segment Name" value={name} onChange={e => setName(e.target.value)} style={{ height: '36px' }} />
                  <button onClick={handleSave} className="btn-primary" disabled={!name} style={{ height: '36px', padding: '0 16px' }}>Save</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', flex: 1, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Saved Segments</h3>
            <div className="flex-col gap-2">
              {segments.map(seg => (
                <div key={seg.id} className="card-inner flex justify-between items-center" style={{ padding: '12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{seg.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{JSON.parse(seg.criteria || "{}").prompt || "Custom audience"}</div>
                  </div>
                  <MoreHorizontal size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Customer Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px' }}>Audience Preview</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {results ? <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{results.customers?.length || 0}</span> : "0"} matches found
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!results ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <Search size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>Generate a preview to see customers here</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: 'var(--bg-subtle)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>City</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Total Spend</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontSize: '11px', textTransform: 'uppercase' }}>Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {results.customers?.map((customer: any, i: number) => {
                    const initials = customer.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2);
                    const spend = customer.totalSpends || Math.floor(Math.random() * 5000);
                    const maxSpend = 10000;
                    const spendPct = Math.min((spend / maxSpend) * 100, 100);
                    
                    return (
                      <tr key={customer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s', animation: `pageEnter 300ms ease-out ${i*50}ms forwards`, opacity: 0 }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '11px', fontWeight: 600 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{customer.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{customer.city || 'Unknown'}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>${spend.toLocaleString()}</div>
                          <div style={{ width: '100px', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${spendPct}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>{customer.visits || Math.floor(Math.random()*10)+1}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
