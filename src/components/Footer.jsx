import React from 'react';
import { Mail, Phone, MapPin, Share2, Play, Send, MessageCircle } from 'lucide-react';

export default function Footer({ setActiveTab }) {

  const navigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <footer style={{
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
          <img src="/logo2.jpeg" alt="Zylix 3D" style={{ height: '40px', width: 'auto', objectFit: 'contain', marginLeft: '-150px' }} />
          <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: '1.75', maxWidth: '220px' }}>
            Premium custom 3D printing — keychains, wall art, masks, miniatures & more. Made with precision, delivered with care.
          </p>
          {/* Social Icons */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
            {[
              { Icon: Share2, label: 'Instagram' },
              { Icon: Play, label: 'YouTube' },
              { Icon: Send, label: 'Twitter / X' },
              { Icon: MessageCircle, label: 'WhatsApp' },
            ].map(({ Icon, label }) => (
              <button key={label} title={label} style={{
                background: '#111', border: '1px solid #222', color: '#666',
                width: '34px', height: '34px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                borderRadius: '4px'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#222'; }}
              >
                <Icon size={14} />
              </button>
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
              { icon: <Mail size={13} />, text: 'support@zen3d.in' },
              { icon: <Phone size={13} />, text: '+91 96299 35467' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#666' }}>
                <span style={{ color: '#444', flexShrink: 0, marginTop: '3px' }}>{item.icon}</span>
                <span style={{ fontSize: '0.78rem', lineHeight: '1.5', color: '#888' }}>{item.text}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.72rem', color: '#444', marginTop: '0.1rem' }}>Mon – Sat: 9:00 AM – 7:00 PM | Sun: Closed</p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919629935467"
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
