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
  };

  const leftBrandingPanel = (
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
        <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
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
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.25em' }}
                />
                <ShieldCheck size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '38px', marginTop: '0.25rem' }}>
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
        <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
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
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
                />
                <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '38px', marginTop: '0.25rem' }}>
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
        <div style={{ padding: isMobile ? '1.5rem 1.25rem' : '2rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
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
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.25em' }}
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
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
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
                  style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
                />
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '38px', marginTop: '0.25rem' }}>
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
                style={{ paddingLeft: '2.5rem', height: '34px', fontSize: '0.8rem' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '38px', marginTop: '0.25rem' }}>
            {loading ? "Processing..." : (isRegister ? "Send Verification OTP" : "Sign In")}
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
