import React from 'react';
import { X, Trash2, CreditCard, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  setActiveTab
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('cart-drawer-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('cart-drawer-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('cart-drawer-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : null; // null = calculated at checkout
  const finalTotal = subtotal + (shipping ?? 0);

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
        position: 'fixed', inset: 0, zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      {/* Drawer panel */}
      <div
        className="cart-drawer-panel"
        style={{
          width: '100%', maxWidth: '380px', height: '100dvh',
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
            cartItems.map((item, index) => {
              const imgSrc = item.image || item.image_url || item.img || item.picture || '/images/categories/keychains.jpg';
              return (
                <div key={index} style={{
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  border: '1px solid #ebebeb',
                  padding: '0.75rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <img
                    src={imgSrc}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/categories/keychains.jpg'; }}
                    style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: '700', color: '#111', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    {item.isCustom && (
                      <p style={{ fontSize: '0.7rem', color: '#666', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{item.customText}" · {item.textColor}/{item.baseColor}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888', backgroundColor: '#f2f2f2', padding: '1px 6px', borderRadius: '4px' }}>
                        Qty: {item.quantity}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#000' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem && onRemoveItem(index)}
                    style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', padding: '4px', flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Summary + Go to Cart button */}
        {cartItems.length > 0 && (
          <div style={{ backgroundColor: '#fff', borderTop: '1px solid #ebebeb', padding: '1rem 1rem calc(1.2rem + env(safe-area-inset-bottom, 12px)) 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <Row label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
              <Row label="Shipping" value={shipping === 0 ? 'FREE' : 'Proceed your pincode'} />
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
