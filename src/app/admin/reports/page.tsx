'use client';

import { useEffect, useState } from 'react';

type ReportData = {
  daily: {
    total: number;
    breakdown: { service_name: string; count: number }[];
  };
  weekly: {
    total: number;
    breakdown: { service_name: string; count: number }[];
  };
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch reports');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: '24px' }}>Reports & Analytics</h1>
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ marginBottom: '24px' }}>Reports & Analytics</h1>
        <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Reports & Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Daily Summary Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Today's Tokens</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Generated in the last 24h</p>
            </div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--foreground)' }}>
            {data?.daily.total || 0}
          </div>
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Breakdown by Service</h4>
            {data?.daily.breakdown.length === 0 ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No tokens generated today.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data?.daily.breakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>{item.service_name}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Summary Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px', color: 'var(--success)', display: 'flex' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>This Week's Tokens</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Generated in the last 7 days</p>
            </div>
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--foreground)' }}>
            {data?.weekly.total || 0}
          </div>
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Breakdown by Service</h4>
            {data?.weekly.breakdown.length === 0 ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No tokens generated this week.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data?.weekly.breakdown.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>{item.service_name}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
