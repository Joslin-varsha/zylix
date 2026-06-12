import React from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function LoginView({ onLogin, setActiveTab, loginMessage, setLoginMessage }) {
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (isRegister && (!name || name.trim().length < 2)) {
      setValidationError("Full name must be at least 2 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const username = isRegister ? name : email.split('@')[0];
    onLogin({ name: username, email });
    setActiveTab('shop'); // Redirect to e-store after mock login
  };

  return (
    <div style={{
      maxWidth: isMobile ? '440px' : '800px',
      width: isMobile ? 'calc(100% - 2.5rem)' : 'auto',
      margin: isMobile ? '2rem auto' : '1rem auto',
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : 'row',
      gridTemplateColumns: isMobile ? 'none' : 'repeat(auto-fit, minmax(300px, 1fr))',
      minHeight: isMobile ? 'auto' : '440px',
      overflow: 'hidden',
      animation: 'fadeInUp 0.4s ease-out'
    }}>
      {/* Left Panel: Stark image background with Branding details */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.5rem',
        height: isMobile ? '110px' : 'auto'
      }}>
        <img 
          src="/logo.png" 
          alt="Zylix Logo" 
          style={{ 
            width: isMobile ? '180px' : '280px',
            height: 'auto',
            objectFit: 'contain',
            cursor: 'pointer'
          }} 
          onClick={() => setActiveTab('shop')}
        />
      </div>

      {/* Right Panel: Stark White with Login Inputs */}
      <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {isRegister ? "Register to save custom designs and request quotes" : "Sign in to track orders and save CAD uploads"}
        </p>

        {loginMessage && (
          <div style={{
            backgroundColor: '#000000',
            border: '1px solid #1a1a1a',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            animation: 'fadeInUp 0.25s ease-out'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              {loginMessage}
            </span>
            <button 
              onClick={() => setLoginMessage('')} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#888888', padding: '2px' }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = '#888888'}
            >
              ✕
            </button>
          </div>
        )}

        {validationError && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            padding: '0.65rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            animation: 'fadeInUp 0.25s ease-out'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              {validationError}
            </span>
            <button 
              onClick={() => setValidationError('')} 
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#b91c1c', padding: '2px' }}
              onMouseEnter={(e) => e.target.style.color = '#7f1d1d'}
              onMouseLeave={(e) => e.target.style.color = '#b91c1c'}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {isRegister && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
                />
                <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
              />
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', height: '38px', marginTop: '0.25rem' }}>
            {isRegister ? "Register Account" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isRegister ? "Already have an account?" : "New to Zylix 3D?"}
            </span>{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setEmail('');
                setPassword('');
                setName('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#000000',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? "Login Here" : "Register Here"}
            </button>
          </div>
          <div>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ← Back to E-Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
