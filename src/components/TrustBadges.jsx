import React from 'react';
import { Layers, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function TrustBadges() {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);

  const badges = [
    { icon: <Layers size={24} />, title: 'Precision 3D Printing', desc: '20-micron tolerances on SLA & FDM custom prints.' },
    { icon: <ShieldCheck size={24} />, title: 'Secure Checkout', desc: 'Encrypted payments with instant billing receipts.' },
    { icon: <Truck size={24} />, title: 'Express Shipping', desc: 'Dispatch within 48 hours with tracking.' },
    { icon: <RotateCcw size={24} />, title: 'Quality Guarantee', desc: "Free reprint if parts don't match your design." },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
      <div style={{
        maxWidth: '95%', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {badges.map((item, i) => (
          <div 
            key={i} 
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              gap: '0.75rem',
              padding: '2rem 1.5rem',
              backgroundColor: '#ffffff',
              border: hoveredIdx === i ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: hoveredIdx === i ? '0 12px 24px var(--accent-glow)' : '0 4px 12px rgba(0,0,0,0.01)',
              transform: hoveredIdx === i ? 'translateY(-5px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ 
              color: hoveredIdx === i ? '#ffffff' : 'var(--accent-color)', 
              backgroundColor: hoveredIdx === i ? 'var(--accent-color)' : 'var(--accent-grey)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: hoveredIdx === i ? 'rotate(360deg)' : 'rotate(0deg)'
            }}>
              {item.icon}
            </div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '200px', lineHeight: '1.6' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
