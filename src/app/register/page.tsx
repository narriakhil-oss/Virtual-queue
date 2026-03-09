'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel animate-slide-up" style={{ padding: '48px', width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}>Create an Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join VQueue and save time</p>
        </div>

        {error && (
          <div style={{ padding: '12px', marginBottom: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Full Name</label>
            <input 
              type="text" name="name" className="input" placeholder="John Doe" 
              value={formData.name} onChange={handleChange} required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Email Address</label>
            <input 
              type="email" name="email" className="input" placeholder="john@example.com" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" name="password" className="input" placeholder="Create a strong password" 
              value={formData.password} onChange={handleChange} required minLength={6}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Phone Number (Optional)</label>
            <input 
              type="tel" name="phone" className="input" placeholder="+1 (555) 000-0000" 
              value={formData.phone} onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
          <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--surface-border)' }}></div>
        </div>

        <button 
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              // Mocking a successful Google OAuth callback
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: `google.user.${Math.floor(Math.random()*1000)}@gmail.com`, 
                  name: 'Google User',
                  googleId: '10482938491283'
                })
              });
              
              if (res.ok) {
                window.location.href = '/dashboard';
              } else {
                const data = await res.json();
                setError(data.error);
              }
            } catch(e) {
              setError('Google Auth Failed');
            } finally {
              setLoading(false);
            }
          }}
          className="btn glass-panel" 
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'white', color: '#333', border: '1px solid #ddd', fontWeight: 600, transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
          disabled={loading}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            <path d="M1 1h22v22H1z" fill="none"/>
          </svg>
          Sign in with Google
        </button>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
