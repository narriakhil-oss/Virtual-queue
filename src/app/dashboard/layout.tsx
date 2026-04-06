'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Phone } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
          if (!data.user.phone) {
            setShowPhoneModal(true);
          }
        }
      });
  }, [router]);

  const handlePhoneSubmit = async () => {
    setPhoneError('');
    const cleaned = phoneInput.replace(/\s+/g, '');
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError('Enter a valid 10-digit Indian mobile number (starts with 6-9)');
      return;
    }
    setPhoneSaving(true);
    try {
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev: any) => ({ ...prev, phone: cleaned }));
        setShowPhoneModal(false);
      } else {
        setPhoneError(data.error || 'Failed to save phone number');
      }
    } catch {
      setPhoneError('Network error. Please try again.');
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!user) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>

      {/* Mandatory Phone Number Modal */}
      {showPhoneModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'var(--surface)', borderRadius: '16px',
            padding: '36px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: '1px solid var(--surface-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: 'var(--primary-glow)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Phone size={22} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Phone Number Required</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
              We need your mobile number to send you queue updates and appointment notifications via SMS.
            </p>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <span style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500,
              }}>+91</span>
              <input
                id="phone-input"
                type="tel"
                className="input"
                placeholder="9876543210"
                maxLength={10}
                value={phoneInput}
                onChange={(e) => { setPhoneInput(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handlePhoneSubmit()}
                style={{ paddingLeft: '52px', width: '100%' }}
                autoFocus
              />
            </div>
            {phoneError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0 12px' }}>{phoneError}</p>
            )}
            <button
              id="save-phone-btn"
              className="btn btn-primary"
              onClick={handlePhoneSubmit}
              disabled={phoneSaving}
              style={{ width: '100%', marginTop: phoneError ? '0' : '12px', padding: '12px' }}
            >
              {phoneSaving ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: '220px', 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--surface-border)', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--surface-border)' }}>
          <Link href="/dashboard" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="VQueue Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
            VQueue
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', backgroundColor: 'var(--surface-border)', border: 'none', color: 'var(--primary)', fontWeight: 600 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Dashboard
          </Link>
          <Link href="/display" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '12px 16px', border: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
            Public TV Boards
          </Link>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', border: '1px solid var(--surface-border)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '48px', maxWidth: '1200px', margin: '0 auto' }} className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
