import React from 'react';
import { Mail, Phone, MapPin, Share2, Play, Send, MessageCircle } from 'lucide-react';

const InstagramIcon = ({ size = 14 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer({ setActiveTab }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) return null;

  const navigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo(0, 0);
  };

  const policies = [
    { label: 'Help & FAQ', tab: 'faq' },
    { label: 'Track My Order', tab: 'contact' },
    { label: 'Return & Refund', tab: 'refund' },
    { label: 'Shipping Policy', tab: 'shipping' },
    { label: 'Bulk / B2B Orders', tab: 'contact' },
    { label: 'About Us', tab: 'about' }
  ];

  const linkStyle = {
    color: '#888888',
    textDecoration: 'none',
    fontSize: '0.82rem',
    transition: 'color 0.2s',
    cursor: 'pointer',
    lineHeight: '1.6'
  };


  return (
    <footer className="desktop-only-footer" style={{
      backgroundColor: '#0a0a0a',
      borderTop: '1px solid #1a1a1a',
      marginTop: '4rem',
      position: 'relative',
      zIndex: 10
    }}>


      {/* Main Footer Links */}
      <div className="footer-links-grid" style={{
        maxWidth: '95%', margin: '0 auto',
        padding: '3.5rem 1.5rem 2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '2.5rem'
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 1' }}>
          <img src="/logo2.jpeg" alt="Zylix 3D" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: '1.75', maxWidth: '220px' }}>
            Premium custom 3D printing — keychains, wall art, masks, miniatures & more. Made with precision, delivered with care.
          </p>
          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
            {[
              { Icon: InstagramIcon, label: 'Instagram', url: 'https://www.instagram.com/zylix_3d_official/' },
              { Icon: MessageCircle, label: 'WhatsApp', url: 'https://wa.me/917871013024' },
              { Icon: Play, label: 'YouTube', url: '#' },
              { Icon: Send, label: 'Twitter / X', url: '#' },
            ].map(({ Icon, label, url }) => (
              <a 
                key={label} 
                href={url} 
                target={url !== '#' ? '_blank' : '_self'} 
                rel="noopener noreferrer" 
                title={label} 
                style={{
                  background: '#111', border: '1px solid #222', color: '#666',
                  width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  borderRadius: '4px', textDecoration: 'none'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E1306C'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#E1306C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#222'; }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>


        {/* Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Services</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Upload File to Print', tab: 'ailab' },
              { label: 'Design Your Own', tab: 'designer' },
              { label: 'Spare Parts', tab: 'spareparts' },
              { label: 'Prototype Lab', tab: 'student' },
              { label: 'Bulk / B2B Orders', tab: 'shop' },
              { label: 'Custom Order Request', tab: 'shop' },
            ].map((item, i) => (
              <li key={i}>
                <span style={linkStyle} onClick={() => navigate(item.tab)}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#888'}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Help</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {policies.map((item, i) => (
              <li key={i}>
                <span style={linkStyle} onClick={() => navigate(item.tab)}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#888'}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Contact Us</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: <MapPin size={13} />, text: 'Mulagumoodu, Tamil Nadu – 629167' },
              { icon: <Mail size={13} />, text: 'support@zylix3d.in' },
              { icon: <Phone size={13} />, text: '+91 78710 13024' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#666' }}>
                <span style={{ color: '#444', flexShrink: 0, marginTop: '3px' }}>{item.icon}</span>
                <span style={{ fontSize: '0.78rem', lineHeight: '1.5', color: '#888' }}>{item.text}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.72rem', color: '#444', marginTop: '0.1rem' }}>Mon – Sat: 9:00 AM – 7:00 PM | Sun: Closed</p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/917871013024"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#25D366', color: '#fff', padding: '0.45rem 0.9rem',
                fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none',
                borderRadius: '4px', marginTop: '0.25rem', width: 'fit-content'
              }}
            >
              <MessageCircle size={13} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>


      {/* Bottom Bar */}
      <div className="footer-bottom-bar" style={{ borderTop: '1px solid #111', padding: '1rem 1.5rem' }}>
        <div className="footer-bottom-container" style={{
          maxWidth: '95%', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#333' }}>
            © {new Date().getFullYear()} Zylix 3D. All rights reserved. | Made with precision. Printed with passion.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Shipping Policy'].map((item, i) => {
              const tabMap = { 'Privacy Policy': 'privacy', 'Terms of Service': 'terms', 'Refund Policy': 'refund', 'Shipping Policy': 'shipping' };
              return (
                <span key={i} style={{ fontSize: '0.7rem', color: '#333', cursor: 'pointer', transition: 'color 0.2s' }}
                  onClick={() => navigate(tabMap[item])}
                  onMouseEnter={e => e.target.style.color = '#888'}
                  onMouseLeave={e => e.target.style.color = '#333'}
                >{item}</span>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
