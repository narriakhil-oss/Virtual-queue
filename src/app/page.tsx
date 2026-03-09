import Link from 'next/link';
import { Clock, Smartphone, Bell, Shield, Users, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <nav style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', position: 'sticky', top: 0, backgroundColor: 'rgba(248, 250, 252, 0.9)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="VQueue Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
          VQueue
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '1rem' }}>Log In</Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '1rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="auth-wrapper" style={{ minHeight: '85vh', padding: '64px 24px' }}>
        <div className="glass-panel animate-slide-up" style={{ padding: '64px', maxWidth: '900px', textAlign: 'center', border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div style={{ marginBottom: '32px' }}>
            <div className="pulse-primary" style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={40} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1.1 }}>
            Reclaim Your Time with Virtual Queuing
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
            Join lines remotely, track your live position from anywhere, and arrive exactly when it's your turn. Say goodbye to crowded waiting rooms forever.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '18px 36px', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}>
              Join a Queue <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '96px 24px', backgroundColor: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>How VQueue Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>Skip the physical line in three easy steps.</p>
          </div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { step: 1, title: 'Find Service', desc: 'Browse available hospitals, banks, and govt offices.', icon: <Smartphone size={32} color="var(--primary)" /> },
              { step: 2, title: 'Get Token', desc: 'Secure your spot and receive an estimated waiting time instantly.', icon: <Zap size={32} color="var(--secondary)" /> },
              { step: 3, title: 'Arrive On Time', desc: 'Track live progress and get notified when you are next in line.', icon: <Bell size={32} color="var(--success)" /> }
            ].map((s) => (
              <div key={s.step} style={{ flex: '1 1 300px', padding: '32px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-lg)', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{s.step}</div>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '96px 24px', backgroundColor: 'var(--background)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>Why Choose VQueue?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { title: 'Live ETA Tracking', desc: 'Knowing is half the battle. Get accurate minute-by-minute calculations based on live service speeds.', icon: <CheckCircle /> },
                { title: 'Reduce Congestion', desc: 'Help facilities manage crowds effectively by keeping waiting rooms completely empty until necessary.', icon: <Users /> },
                { title: 'Secure & Private', desc: 'Your data is encrypted. Service providers only see your token number and first name.', icon: <Shield /> }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '4px' }}>{f.icon}</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{f.title}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: '48px', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
             <h3 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Live Queue Example</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', background: 'linear-gradient(to right, rgba(79, 70, 229, 0.05), transparent)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Currently Serving</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>A-42</div>
                </div>
                <div style={{ padding: '16px', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--warning)', fontWeight: 600 }}>Your Token (Waiting)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>A-45</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>People Ahead: 2 | Est: 10 mins</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '64px 24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-around' }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>100k+</div>
            <div style={{ opacity: 0.9, fontSize: '1.125rem' }}>Hours Saved</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>500+</div>
            <div style={{ opacity: 0.9, fontSize: '1.125rem' }}>Service Centers</div>
          </div>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 700 }}>99.9%</div>
            <div style={{ opacity: 0.9, fontSize: '1.125rem' }}>Uptime Reliability</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px 24px', background: 'white', borderTop: '1px solid var(--surface-border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} VQueue. Built for effortless time management.</p>
      </footer>
    </div>
  );
}
