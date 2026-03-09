'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';

export default function DisplayPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const resolvedParams = use(params);
  const serviceId = resolvedParams.serviceId;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/public/display/${serviceId}`)
        .then(r => r.json())
        .then(result => {
          if (!result.error) setData(result);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // 3 seconds fast polling for TV displays
    return () => clearInterval(interval);
  }, [serviceId]);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
        <div className="pulse-primary" style={{ padding: '24px', borderRadius: 'var(--radius-full)', background: 'var(--primary)', color: 'white' }}>
          Loading Board...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header style={{ padding: '32px 48px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <div>
          <h1 style={{ fontSize: '3rem', margin: 0, fontWeight: 700, lineHeight: 1.2 }}>{data.service?.name}</h1>
          <div style={{ fontSize: '1.5rem', opacity: 0.9 }}>📍 {data.service?.location}</div>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 600 }}>
          {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', padding: '48px', gap: '48px' }}>
        
        {/* Currently Serving (Left massive view) */}
        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '64px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px solid var(--primary-glow)', boxShadow: '0 0 40px var(--primary-glow)' }}>
            <h2 style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Now Serving
            </h2>
            <div style={{ fontSize: '15rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>
              {data.currentlyServing?.token_number || '--'}
            </div>
            {data.currentlyServing && (
              <div style={{ fontSize: '2rem', color: 'var(--success)', marginTop: '24px', fontWeight: 600 }}>
                Please proceed to the counter
              </div>
            )}
          </div>
        </div>

        {/* Up Next List (Right view) */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', paddingLeft: '24px', borderLeft: '8px solid var(--secondary)' }}>Up Next</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.upNext?.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', fontSize: '1.5rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
                No active tokens waiting.
              </div>
            ) : (
              data.upNext?.map((token: any, idx: number) => {
                const isScheduled = token.status === 'scheduled';
                
                return (
                  <div key={token.token_number} className="glass-panel" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: token.is_emergency === 1 ? 'rgba(239, 68, 68, 0.1)' : idx === 0 ? 'rgba(6, 182, 212, 0.1)' : 'var(--surface)', border: token.is_emergency === 1 ? '2px solid var(--danger)' : idx === 0 ? '2px solid var(--secondary)' : '1px solid var(--surface-border)', borderLeft: token.is_emergency === 1 ? '8px solid var(--danger)' : isScheduled ? '8px solid var(--success)' : (idx === 0 ? '2px solid var(--secondary)' : '1px solid var(--surface-border)') }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '3.5rem', fontWeight: 700, color: token.is_emergency === 1 ? 'var(--danger)' : 'inherit' }}>{token.token_number}</div>
                      {token.is_emergency === 1 && (
                        <div style={{ fontSize: '1rem', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, background: 'var(--danger)', color: 'white', letterSpacing: '2px', animation: 'pulse 2s infinite' }}>EMERGENCY</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {isScheduled ? (
                        <>
                          <div style={{ fontSize: '1.5rem', color: 'var(--success)' }}>Scheduled</div>
                          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)' }}>
                             {new Date(token.appointment_time.endsWith('Z') ? token.appointment_time : token.appointment_time + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Estimated Wait</div>
                          <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>~{((idx + 1) * 5)} mins</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </main>

      {/* Footer Ticker */}
      <footer style={{ background: 'var(--foreground)', color: 'white', padding: '16px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite', fontSize: '1.5rem' }}>
          Welcome to {data.service?.name}. Please take a token online at VQueue from your mobile device to join the waitlist. Track your position in real-time from your phone!
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
        `}} />
      </footer>
    </div>
  );
}
