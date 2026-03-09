'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [queueData, setQueueData] = useState<{ queue: any[], currentlyServing: any, nextAvailableSlot?: string, serviceDetails?: any } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        setServices(data.services || []);
        if (data.services?.length > 0) {
          setSelectedService(data.services[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedService) return;

    const fetchQueue = () => {
      fetch(`/api/admin/queue/${selectedService}`)
        .then(r => r.json())
        .then(data => {
          if (!data.error) {
            setQueueData(data);
          }
        });
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [selectedService]);

  const handleCallNext = async () => {
    if (!selectedService) return;
    setActionLoading(true);
    
    try {
      const res = await fetch(`/api/admin/queue/${selectedService}`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to call next token');
      } else {
        alert(data.message);
      }
      
      // refresh instantly
      fetch(`/api/admin/queue/${selectedService}`)
        .then(r => r.json())
        .then(qReq => {
          if (!qReq.error) setQueueData(qReq);
        });
    } catch (err) {
      alert('Network error while processing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleToken = async (tokenId: number) => {
    const timeValue = document.getElementById(`time-${tokenId}`) as HTMLInputElement;
    if (!timeValue || !timeValue.value) {
      alert('Please select a date and time.');
      return;
    }

    setActionLoading(true);
    try {
      // Must convert local datetime-local to ISO string or similar SQLite parsable format
      const dateObj = new Date(timeValue.value);
      const isoString = dateObj.toISOString();

      const res = await fetch(`/api/admin/queue/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, appointmentTime: isoString })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to schedule token');
      }
      
      // refresh instantly
      fetch(`/api/admin/queue/${selectedService}`)
        .then(r => r.json())
        .then(qReq => {
          if (!qReq.error) setQueueData(qReq);
        });
    } catch (err) {
      alert('Network error while processing');
    } finally {
      setActionLoading(false);
    }
  };

  const formatIST = (dateStr: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Queue & Appointment Management</h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedService(s.id)}
            className={`btn ${selectedService === s.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {queueData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(350px, 2fr) minmax(280px, 1fr)', gap: '24px' }}>
          
          {/* Action Panel */}
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Currently Serving</h2>
            
            <div style={{ fontSize: '4rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent', marginBottom: '16px', lineHeight: 1 }}>
              {queueData.currentlyServing?.token_number || '--'}
            </div>
            
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
               Status: {queueData.currentlyServing ? 'In Progress' : 'Idle'}
            </p>

            <button 
              onClick={handleCallNext} 
              className="btn btn-primary pulse-primary" 
              style={{ width: '100%', padding: '16px' }}
              disabled={actionLoading || queueData.queue.length === 0}
            >
              {actionLoading ? 'Processing...' : queueData.queue.length === 0 ? 'Queue Empty' : 'Call Next Token'}
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Tokens List ({queueData.queue.length})</h2>
            </div>

            {queueData.queue.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                No active tokens in this service list.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
                {queueData.queue.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: item.is_emergency === 1 ? '2px solid var(--danger)' : '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', background: item.is_emergency === 1 ? 'rgba(239, 68, 68, 0.05)' : item.status === 'pending' ? 'rgba(244, 63, 94, 0.05)' : 'var(--surface)', borderLeft: item.is_emergency === 1 ? '6px solid var(--danger)' : item.status === 'pending' ? '4px solid var(--accent)' : item.status === 'scheduled' ? '4px solid var(--success)' : '1px solid var(--surface-border)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                         <div style={{ fontWeight: 700, fontSize: '1.25rem', color: item.is_emergency === 1 ? 'var(--danger)' : 'var(--foreground)' }}>{item.token_number}</div>
                         <div style={{ fontSize: '0.875rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, background: item.status === 'pending' ? 'rgba(244, 63, 94, 0.1)' : item.status === 'scheduled' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: item.status === 'pending' ? 'var(--accent)' : item.status === 'scheduled' ? 'var(--success)' : 'var(--warning)'}}>
                           {item.status.toUpperCase()}
                         </div>
                         {item.is_emergency === 1 && (
                           <div style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: 'var(--danger)', color: 'white', letterSpacing: '0.5px', animation: 'pulse 2s infinite' }}>
                             EMERGENCY PRIORITY
                           </div>
                         )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.user_name}</div>
                      
                      {item.is_emergency === 1 && item.emergency_utr && (
                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                          <span style={{ fontWeight: 600 }}>Verify UTR:</span> <code style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '1px' }}>{item.emergency_utr}</code>
                        </div>
                      )}
                      
                      {item.status === 'scheduled' && (
                        <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          Appointment Time: <strong style={{ color: 'var(--foreground)' }}>{formatIST(item.appointment_time)}</strong>
                        </div>
                      )}
                    </div>
                    
                    {item.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Suggested Next Slot:</div>
                        <input 
                          type="datetime-local" 
                          id={`time-${item.id}`}
                          defaultValue={queueData.nextAvailableSlot ? new Date(queueData.nextAvailableSlot.endsWith('Z') ? queueData.nextAvailableSlot : queueData.nextAvailableSlot + 'Z').toLocaleString('sv').replace(' ', 'T').slice(0, 16) : ''}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'var(--background)' }}
                        />
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.875rem', padding: '8px' }}
                          onClick={() => handleScheduleToken(item.id)}
                          disabled={actionLoading}
                        >
                          Appoint Time
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Service Details & Capacity Sidebar */}
          {queueData.serviceDetails && (
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content', borderTop: '4px solid var(--primary)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Service Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Operating Hours</span>
                  <strong style={{ fontSize: '0.875rem' }}>
                    {queueData.serviceDetails.operating_start} - {queueData.serviceDetails.operating_end}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Slot Duration</span>
                  <strong>{queueData.serviceDetails.service_duration_mins} mins</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Appointments Today</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                    <strong>{queueData.queue.filter(q => q.status === 'scheduled').length}</strong>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pending Requests</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
                     <strong style={{ color: 'var(--accent)' }}>{queueData.queue.filter(q => q.status === 'pending').length}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    The system automatically calculates the next slot and skips over closing times to prevent overbooking. Admins can manually override times using the Date Pickers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
