import React from 'react';
import { X, Trash2, CreditCard, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  setActiveTab
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 150; // default shipping estimate
  const finalTotal = subtotal + shipping;

  const handleGoToCart = () => {
    onClose();
    if (setActiveTab) setActiveTab('cart');
  };

  const Row = ({ label, value, bold, accent }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.82rem', color: accent ? '#000' : '#888', fontWeight: bold ? '700' : '400', display: 'flex', alignItems: 'center', gap: '4px' }}>{label}</span>
      <span style={{ fontSize: bold ? '1rem' : '0.85rem', color: '#000', fontWeight: bold ? '800' : '500', fontFamily: bold ? 'var(--font-display)' : 'inherit' }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      {/* Drawer panel */}
      <div
        style={{
          width: '100%', maxWidth: '380px', height: '100%',
          backgroundColor: '#f9f9f9',
          display: 'flex', flexDirection: 'column',
          position: 'relative', cursor: 'default',
          animation: 'slideLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          borderLeft: '1px solid #e5e5e5'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HEADER ── */}
        <div style={{
          backgroundColor: '#000', color: '#fff',
          padding: '0.9rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={18} />
            <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Cart — {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <ShoppingBag size={40} style={{ color: '#ddd' }} />
              <p style={{ color: '#888', fontSize: '0.9rem', fontWeight: '600' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.78rem', color: '#bbb', maxWidth: '220px', lineHeight: '1.6' }}>
                Browse our store and add items to get started.
              </p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                border: '1px solid #ebebeb',
                padding: '0.65rem',
                display: 'flex', gap: '0.65rem', alignItems: 'flex-start',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '50px', height: '50px', borderRadius: '6px',
                  backgroundColor: '#f3f3f3', overflow: 'hidden', flexShrink: 0,
                  border: '1px solid #eee'
                }}>
                  {item.isCustom ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: '800', color: '#555', textAlign: 'center', padding: '4px', backgroundColor: '#f0f0f0' }}>
                      STL<br />PRINT
                    </div>
                  ) : (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#111', lineHeight: '1.3' }}>{item.name}</h4>
                  {item.isCustom && (
                    <p style={{ fontSize: '0.65rem', color: '#999' }}>{item.material} · {item.infill}% infill · {item.resolution}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                    <span style={{
                      fontSize: '0.65rem', color: '#666',
                      backgroundColor: '#f5f5f5', padding: '2px 8px',
                      borderRadius: '20px', border: '1px solid #e8e8e8'
                    }}>Qty: {item.quantity}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#000', fontFamily: 'var(--font-display)' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemoveItem(index)}
                  style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', padding: '2px', flexShrink: 0, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary + Go to Cart button */}
        {cartItems.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderTop: '1px solid #ebebeb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <Row label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
              <Row label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} />
              <div style={{ borderTop: '1px dashed #e5e5e5', marginTop: '0.2rem', paddingTop: '0.65rem' }}>
                <Row label="Total" value={`₹${Math.round(finalTotal).toLocaleString('en-IN')}`} bold />
              </div>
            </div>

            <button
              onClick={handleGoToCart}
              style={{
                width: '100%', height: '42px', backgroundColor: '#000', color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.05em',
                textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#222'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
            >
              <CreditCard size={16} /> Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
