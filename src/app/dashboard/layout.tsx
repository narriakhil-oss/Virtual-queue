'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
        }
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (!user) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
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
