'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [services, setServices] = useState<any[]>([]);
  const [myTokens, setMyTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState<number | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<number | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState(false);
  const [utr, setUtr] = useState('');

  const formatIST = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    const fetchData = async () => {
      const [servicesData, tokensData] = await Promise.all([
        fetch('/api/services').then(r => r.json()),
        fetch('/api/queue/status').then(r => r.json())
      ]);
      setServices(servicesData.services || []);
      setMyTokens(tokensData.tokens || []);
      setLoading(false);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  const handleJoinQueue = async (serviceId: number, isEmergency: boolean = false, utrString: string = '') => {
    setJoinLoading(serviceId);
    try {
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, isEmergency, utr: utrString })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to join queue');
        return;
      }
      
      // Close modal and reset
      setShowJoinModal(null);
      setSelectedEmergency(false);
      setUtr('');

      // Refresh tokens
      const statusRes = await fetch('/api/queue/status');
      const statusData = await statusRes.json();
      setMyTokens(statusData.tokens || []);
    } catch (err) {
      console.error(err);
      alert('Error joining queue');
    } finally {
      setJoinLoading(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>

      {myTokens.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-muted)' }}>My Active Tokens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {myTokens.map(token => (
              <div 
                key={token.id} 
                className="glass-panel" 
                style={{ 
                  padding: '32px 24px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  background: 'var(--surface)',
                  borderTop: token.status === 'served' ? '4px solid var(--success)' : token.status === 'scheduled' ? '4px solid var(--primary)' : token.status === 'pending' ? '4px solid var(--accent)' : '4px solid var(--warning)',
                  boxShadow: (token.status === 'waiting' && token.people_ahead === 0) || token.status === 'scheduled' ? '0 0 30px rgba(79, 70, 229, 0.2)' : 'var(--shadow-md)',
                  transition: 'all 0.3s ease'
                }}
              >
                {token.status === 'served' && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '4px', background: 'var(--success)', color: 'white', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>
                    SUCCESSFULLY SERVED
                  </div>
                )}
                
                <div style={{ marginTop: token.status === 'served' ? '16px' : '0' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{token.service_name}</span>
                    <span style={{ padding: '4px 8px', background: 'var(--surface-border)', borderRadius: '12px', fontSize: '0.75rem' }}>
                      Allocated: <strong>{formatIST(token.created_at)}</strong>
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
                    <div className={token.status === 'scheduled' ? 'pulse-primary' : ''} style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>
                      {token.token_number}
                    </div>
                  </div>

                  {/* Pending State */}
                  {token.status === 'pending' && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                      <div style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Awaiting Admin Review
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>Your request is in the queue. An admin will assign you an appointment time shortly.</p>
                    </div>
                  )}

                  {/* Scheduled State */}
                  {token.status === 'scheduled' && (
                    <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                      <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.125rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Appointment Scheduled!
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>
                        {formatIST(token.appointment_time)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Please arrive at the service center 10 minutes before this time.</p>
                    </div>
                  )}
                  
                  {/* Legacy Waiting State (if any leftover) */}
                  {token.status === 'waiting' && (
                    <div style={{ background: 'rgba(248, 250, 252, 0.5)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          People Ahead:
                        </span>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--foreground)' }}>{token.people_ahead}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Est. Wait Time:
                        </span>
                        <strong style={{ color: 'var(--warning)', fontSize: '1.125rem' }}>~{token.estimated_wait_mins} min</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingTop: '12px', borderTop: '1px solid var(--surface-border)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Currently Serving:</span>
                        <strong style={{ padding: '2px 8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '4px' }}>#{token.current_serving}</strong>
                      </div>
                    </div>
                  )}

                  {/* Universal Board Link */}
                  {(token.status === 'scheduled' || token.status === 'waiting' || token.status === 'pending') && (
                    <div style={{ marginTop: '20px' }}>
                      <button 
                        onClick={() => window.open(`/display/${token.service_id}`, '_blank')}
                        className="btn btn-secondary"
                        style={{ width: '100%', fontSize: '0.875rem', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                        View Live TV Board
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--text-muted)' }}>Available Services</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {services.map(service => {
          const isAlreadyInQueue = myTokens.some(t => t.service_id === service.id && t.status === 'waiting');
          
          return (
            <div 
              key={service.id} 
              className="glass-panel" 
              style={{ 
                padding: '32px 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease',
                cursor: 'pointer',
                borderTop: '4px solid var(--primary)',
                background: 'var(--surface)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg), 0 0 20px rgba(79, 70, 229, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: 600 }}>{service.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {service.location}
                </p>
              </div>
              
              <button 
                onClick={() => setShowJoinModal(service.id)} 
                className={`btn ${isAlreadyInQueue ? 'btn-secondary' : 'btn-primary'}`} 
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                disabled={isAlreadyInQueue || joinLoading === service.id}
              >
                {joinLoading === service.id ? 'Securing Spot...' : isAlreadyInQueue ? 'Already Queued' : 'Join Queue'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Emergency Payment Modal */}
      {showJoinModal !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: 'var(--surface)', position: 'relative' }}>
            
            <button 
              onClick={() => { setShowJoinModal(null); setSelectedEmergency(false); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Join Queue</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>Select your priority level for this service.</p>

            {/* Selection Toggle */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div 
                onClick={() => setSelectedEmergency(false)}
                style={{ flex: 1, padding: '16px', border: selectedEmergency ? '1px solid var(--surface-border)' : '2px solid var(--primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', opacity: selectedEmergency ? 0.6 : 1, transition: 'all 0.2s', background: selectedEmergency ? 'transparent' : 'rgba(79, 70, 229, 0.05)' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Standard</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Free</div>
              </div>
              <div 
                onClick={() => setSelectedEmergency(true)}
                style={{ flex: 1, padding: '16px', border: selectedEmergency ? '2px solid var(--danger)' : '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', opacity: selectedEmergency ? 1 : 0.6, transition: 'all 0.2s', background: selectedEmergency ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px', color: selectedEmergency ? 'var(--danger)' : 'inherit' }}>Emergency</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>₹30 Priority</div>
              </div>
            </div>

            {/* Payment Details Reveal */}
            {selectedEmergency && (
              <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px', color: 'var(--danger)' }}>
                  Scan to Pay ₹30 for Emergency Priority
                </p>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi%3A%2F%2Fpay%3Fpa%3Dakhilnarri%40okicici%26pn%3DAdmin%26am%3D30.00%26cu%3DINR" 
                  alt="UPI QR Code" 
                  style={{ width: '150px', height: '150px', borderRadius: '8px', margin: '0 auto 12px auto' }}
                />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '16px' }}>UPI: akhilnarri@okicici</p>
                
                <div style={{ textAlign: 'left', borderTop: '1px dashed var(--surface-border)', paddingTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>ENTER 12-DIGIT UTR / REF NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 308912345678" 
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', background: 'var(--surface)', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '1px', textAlign: 'center' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                    Required to verify your payment.
                  </p>
                </div>
              </div>
            )}

            <button 
              className={`btn ${selectedEmergency ? 'btn-danger' : 'btn-primary'}`} 
              style={{ width: '100%', padding: '14px', fontSize: '1rem', background: selectedEmergency ? 'var(--danger)' : '', opacity: selectedEmergency && utr.length !== 12 ? 0.5 : 1 }}
              onClick={() => handleJoinQueue(showJoinModal, selectedEmergency, utr)}
              disabled={joinLoading === showJoinModal || (selectedEmergency && utr.length !== 12)}
            >
              {joinLoading === showJoinModal ? 'Processing...' : selectedEmergency ? 'Confirm & Join Emergency' : 'Join Standard Queue'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
