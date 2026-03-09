'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisplaySelectorPage() {
  const [services, setServices] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(data.services || []));
  }, []);

  return (
    <div style={{ padding: '64px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Select Queue Display</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Choose a service to view its live public queue board.</p>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {services.map(s => (
          <button 
            key={s.id}
            onClick={() => router.push(`/display/${s.id}`)}
            className="glass-panel"
            style={{ padding: '24px', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-border)', background: 'var(--surface)' }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{s.name}</h2>
              <div style={{ color: 'var(--text-muted)' }}>📍 {s.location}</div>
            </div>
            <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
              View Board 
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
