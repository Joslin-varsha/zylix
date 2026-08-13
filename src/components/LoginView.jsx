import React from 'react';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function LoginView({ onLogin, setActiveTab, loginMessage, setLoginMessage }) {
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  // OTP and Password Reset States
  const [showRegisterOtp, setShowRegisterOtp] = React.useState(false);
  const [showForgotPass, setShowForgotPass] = React.useState(false);
  const [showResetPass, setShowResetPass] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Check if returning from Supabase Google OAuth redirect
    const hash = window.location.hash;
    if (hash && (hash.includes('access_token=') || hash.includes('type=recovery'))) {
      try {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          // Decode JWT payload without external library
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          const jwtData = JSON.parse(jsonPayload);
          
          if (jwtData && jwtData.email) {
            setLoading(true);
            fetch(`${API_BASE}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: jwtData.user_metadata?.full_name || jwtData.name || jwtData.email.split('@')[0],
                email: jwtData.email,
                picture: jwtData.user_metadata?.avatar_url || null
              })
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.user) {
                  // Clean up hash from URL
                  window.history.replaceState(null, '', window.location.pathname);
                  onLogin(data.user);
                  setActiveTab('shop');
                }
              })
              .catch(err => console.error('OAuth sync error:', err))
              .finally(() => setLoading(false));
          }
        }
      } catch (e) {
        console.error('Failed to parse OAuth hash token:', e);
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cooldown countdown timer for resending OTPs
  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendRegisterOtp = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoginMessage('');

    if (!name || name.trim().length < 2) {
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

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setShowRegisterOtp(true);
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOtpSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (otpCode.length !== 6) {
      setValidationError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register-verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      onLogin(data.user);
      setActiveTab('shop'); // Redirect to e-store on successful registration
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (resendCooldown > 0) return;
    setValidationError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/register-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      setResendCooldown(60);
      setLoginMessage("A new verification code has been sent.");
      setTimeout(() => setLoginMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoginMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password-send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setShowResetPass(true);
      setShowForgotPass(false);
      setResendCooldown(60);
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (otpCode.length !== 6) {
      setValidationError("Please enter a valid 6-digit code.");
      return;
    }

    if (newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Reset to login screen on success
      setShowResetPass(false);
      setShowForgotPass(false);
      setIsRegister(false);
      setEmail('');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setLoginMessage("Password reset successfully. Please sign in with your new password.");
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setLoginMessage('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      onLogin(data.user);
      setActiveTab('shop');
    } catch (err) {
      console.error(err);
      setValidationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonPanelStyles = {
    maxWidth: isMobile ? '100%' : '800px',
    width: isMobile ? 'calc(100% - 1.5rem)' : 'auto',
    margin: isMobile ? '1.5rem auto 2.5rem' : '2rem auto',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-color)',
    borderRadius: isMobile ? '16px' : '12px',
    boxShadow: isMobile ? '0 10px 30px rgba(0, 0, 0, 0.08)' : '0 15px 35px rgba(0, 0, 0, 0.05)',
    display: isMobile ? 'flex' : 'grid',
    flexDirection: isMobile ? 'column' : 'row',
    gridTemplateColumns: isMobile ? 'none' : 'repeat(auto-fit, minmax(300px, 1fr))',
    minHeight: isMobile ? 'auto' : '440px',
    overflow: 'hidden',
    animation: 'fadeInUp 0.4s ease-out'
  };

  const leftBrandingPanel = (
    <div style={{
      backgroundImage: isMobile 
        ? 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)'
        : 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=600")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#ffffff',
      padding: isMobile ? '1.25rem 1rem' : '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      gap: '0.3rem',
      height: isMobile ? 'auto' : 'auto'
    }}>
      <img 
        src="/logo.png" 
        alt="Zylix Logo" 
        style={{ 
          width: isMobile ? '160px' : '280px',
          height: 'auto',
          objectFit: 'contain',
          cursor: 'pointer',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
        }} 
        onClick={() => setActiveTab('shop')}
      />
      {isMobile && (
        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          3D Printing & Manufacturing E-Store
        </span>
      )}
    </div>
  );

  const errorAndMessageAlerts = (
    <>
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
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
            {loginMessage}
          </span>
          <button onClick={() => setLoginMessage('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#888888', padding: '2px' }}>✕</button>
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
          <button onClick={() => setValidationError('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', color: '#b91c1c', padding: '2px' }}>✕</button>
        </div>
      )}
    </>
  );

  // ── VIEW 1: REGISTRATION OTP VERIFICATION SCREEN ──
  if (showRegisterOtp) {
    return (
      <div style={commonPanelStyles}>
        {leftBrandingPanel}
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Verify Email
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Enter the 6-digit verification code sent to <strong style={{ color: '#000' }}>{email}</strong>
          </p>

          {errorAndMessageAlerts}

          <form onSubmit={handleRegisterOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.25em' }}
                />
                <ShieldCheck size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: isMobile ? '44px' : '38px', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '0.85rem' }}>
              {loading ? "Verifying Account..." : "Verify & Register Account"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Didn't receive the email code?</span>{" "}
              <button
                onClick={handleResendRegisterOtp}
                disabled={resendCooldown > 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--text-muted)' : '#000000',
                  fontWeight: '700',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  textDecoration: resendCooldown > 0 ? 'none' : 'underline'
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  setShowRegisterOtp(false);
                  setOtpCode('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cancel & Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 2: FORGOT PASSWORD REQUEST EMAIL SCREEN ──
  if (showForgotPass) {
    return (
      <div style={commonPanelStyles}>
        {leftBrandingPanel}
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Forgot Password
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Enter your email below. We'll send you an OTP to reset your password.
          </p>

          {errorAndMessageAlerts}

          <form onSubmit={handleSendResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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
                  style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.85rem' }}
                />
                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: isMobile ? '44px' : '38px', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '0.85rem' }}>
              {loading ? "Sending Code..." : "Send Verification OTP"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem' }}>
            <button
              onClick={() => {
                setShowForgotPass(false);
                setValidationError('');
                setLoginMessage('');
              }}
              style={{ background: 'transparent', border: 'none', color: '#000000', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 3: RESET PASSWORD SUBMIT SCREEN ──
  if (showResetPass) {
    return (
      <div style={commonPanelStyles}>
        {leftBrandingPanel}
        <div style={{ padding: isMobile ? '1.25rem 1rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Reset Password
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Check your email for the 6-digit OTP code to create a new password.
          </p>

          {errorAndMessageAlerts}

          <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>OTP Verification Code</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="••••••"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.25em' }}
                />
                <ShieldCheck size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.85rem' }}
                />
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.85rem' }}
                />
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: isMobile ? '44px' : '38px', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '0.85rem' }}>
              {loading ? "Updating Password..." : "Update Password & Login"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.78rem' }}>
            <button
              onClick={() => {
                setShowResetPass(false);
                setShowForgotPass(true);
                setOtpCode('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              style={{ background: 'transparent', border: 'none', color: '#000000', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel & Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── VIEW 4: NORMAL LOGIN / SIGN-IN & REGISTER VIEWS ──
  return (
    <div style={commonPanelStyles}>
      {leftBrandingPanel}
      <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {isRegister ? "Register to save custom designs and request quotes" : "Sign in to track orders and save CAD uploads"}
        </p>

        {errorAndMessageAlerts}

        <form onSubmit={isRegister ? handleSendRegisterOtp : handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '600', color: '#000' }}>Password</label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPass(true);
                    setValidationError('');
                    setLoginMessage('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', height: isMobile ? '42px' : '34px', fontSize: '0.85rem' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: isMobile ? '44px' : '38px', marginTop: '0.25rem', fontSize: isMobile ? '0.9rem' : '0.85rem' }}>
            {loading ? "Processing..." : (isRegister ? "Send Verification OTP" : "Sign In")}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0 0.85rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
          <span style={{ padding: '0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }} />
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => {
            const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
            const supabaseOAuthUrl = `https://aghpqypwkqdpchdzcjtw.supabase.co/auth/v1/authorize?provider=google&redirect_to=${redirectUri}`;
            window.location.href = supabaseOAuthUrl;
          }}
          style={{
            width: '100%',
            height: isMobile ? '44px' : '40px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#3c4043',
            border: '1px solid #cbd5e1',
            fontWeight: '700',
            fontSize: isMobile ? '0.85rem' : '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.87 10.78c-.18-.53-.28-1.09-.28-1.78s.1-1.25.28-1.78L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.26z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.26C4.59 5.15 6.62 3.58 9 3.58z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

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
                setValidationError('');
                setLoginMessage('');
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
