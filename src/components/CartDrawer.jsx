import React from 'react';
import { X, Trash2, CreditCard, Lock, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  studentApplied,
  setStudentApplied,
  onClearCart
}) {
  const [checkoutStep, setCheckoutStep] = React.useState('cart');
  const [paymentDetails, setPaymentDetails] = React.useState({ card: '', expiry: '', cvv: '', name: '' });
  const [isPaying, setIsPaying] = React.useState(false);
  const [receiptId, setReceiptId] = React.useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = subtotal * 0.18;
  const shipping = subtotal > 5000 ? 0 : 250;
  const finalTotal = subtotal + gst + shipping;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setReceiptId('ZLX-' + Math.floor(100000 + Math.random() * 900000));
      setCheckoutStep('success');
    }, 2500);
  };

  const handleFinishSuccess = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
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
              {checkoutStep === 'cart' && `Cart — ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`}
              {checkoutStep === 'payment' && 'Secure Checkout'}
              {checkoutStep === 'success' && 'Order Confirmed'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* ══════════════════════════════════════
            STEP 1 — CART
        ══════════════════════════════════════ */}
        {checkoutStep === 'cart' && (
          <>
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

            {/* Summary panel */}
            {cartItems.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderTop: '1px solid #ebebeb', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>

                {/* Price breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <Row label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
                  <Row label="GST (18%)" value={`₹${gst.toLocaleString('en-IN')}`} />
                  <Row label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} />
                  <div style={{ borderTop: '1px dashed #e5e5e5', marginTop: '0.2rem', paddingTop: '0.65rem' }}>
                    <Row label="Total" value={`₹${Math.round(finalTotal).toLocaleString('en-IN')}`} bold />
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep('payment')}
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
                  <CreditCard size={16} /> Proceed to Payment
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — PAYMENT
        ══════════════════════════════════════ */}
        {checkoutStep === 'payment' && (
          <form onSubmit={handleCheckoutSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1.25rem', overflowY: 'auto' }}>

            {/* Sandbox notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0f0f0', padding: '0.65rem 1rem', borderRadius: '8px' }}>
              <Lock size={13} style={{ color: '#555' }} />
              <span style={{ fontSize: '0.75rem', color: '#555' }}>Sandboxed — no real transaction processed.</span>
            </div>

            {/* Amount banner */}
            <div style={{ backgroundColor: '#000', color: '#fff', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Amount Payable</p>
              <p style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'var(--font-display)' }}>₹{Math.round(finalTotal).toLocaleString('en-IN')}</p>
            </div>

            {/* Inputs */}
            {[
              { label: 'Cardholder Name', key: 'name', type: 'text', placeholder: 'Rahul Sharma', max: null },
              { label: 'Card Number', key: 'card', type: 'text', placeholder: '4321 8765 9012 3456', max: 19 },
            ].map(({ label, key, type, placeholder, max }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: '600' }}>{label}</label>
                <input
                  type={type} required placeholder={placeholder}
                  maxLength={max || undefined}
                  value={paymentDetails[key]}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                  style={{
                    height: '44px', padding: '0 1rem', fontSize: '0.88rem',
                    border: '1px solid #e0e0e0', borderRadius: '8px',
                    outline: 'none', fontFamily: 'var(--font-body)',
                    backgroundColor: '#fff', transition: 'border 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            ))}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Expiry (MM/YY)', key: 'expiry', type: 'text', placeholder: '12/28', max: 5 },
                { label: 'CVV', key: 'cvv', type: 'password', placeholder: '•••', max: 3 },
              ].map(({ label, key, type, placeholder, max }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: '600' }}>{label}</label>
                  <input
                    type={type} required placeholder={placeholder} maxLength={max}
                    value={paymentDetails[key]}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, [key]: e.target.value })}
                    style={{
                      height: '44px', padding: '0 1rem', fontSize: '0.88rem',
                      border: '1px solid #e0e0e0', borderRadius: '8px',
                      outline: 'none', fontFamily: 'var(--font-body)',
                      backgroundColor: '#fff', transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                type="submit" disabled={isPaying}
                style={{
                  width: '100%', height: '50px', backgroundColor: '#000', color: '#fff',
                  border: 'none', borderRadius: '10px', cursor: isPaying ? 'not-allowed' : 'pointer',
                  fontWeight: '800', fontSize: '0.88rem', letterSpacing: '0.04em',
                  textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: isPaying ? 0.7 : 1
                }}
              >
                {isPaying ? (
                  <><span className="spinner" /> Processing...</>
                ) : (
                  <><CreditCard size={16} /> Pay ₹{Math.round(finalTotal).toLocaleString('en-IN')}</>
                )}
              </button>
              <button
                type="button" onClick={() => setCheckoutStep('cart')} disabled={isPaying}
                style={{
                  width: '100%', height: '42px', backgroundColor: 'transparent', color: '#555',
                  border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: '600', fontSize: '0.82rem', fontFamily: 'var(--font-body)'
                }}
              >
                ← Back to Cart
              </button>
            </div>
          </form>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — SUCCESS
        ══════════════════════════════════════ */}
        {checkoutStep === 'success' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem', textAlign: 'center', gap: '1.25rem'
          }}>
            <div style={{
              width: '72px', height: '72px', backgroundColor: '#000', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle2 size={36} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#000', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>Order Confirmed!</h3>
              <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: '1.6', maxWidth: '280px' }}>
                Payment simulated. Your design files have been sent to our print farm.
              </p>
            </div>

            {/* Receipt */}
            <div style={{
              width: '100%', backgroundColor: '#fafafa',
              border: '1px solid #ebebeb', borderRadius: '12px',
              padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem'
            }}>
              {[
                { label: 'Receipt ID', value: receiptId, bold: true },
                { label: 'Amount Paid', value: `₹${Math.round(finalTotal).toLocaleString('en-IN')}`, bold: true },
                { label: 'Card Holder', value: paymentDetails.name || 'Valued Customer' },
                { label: 'Est. Delivery', value: '2–5 working days' },
              ].map(({ label, value, bold }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#999' }}>{label}</span>
                  <span style={{ color: '#000', fontWeight: bold ? '700' : '500' }}>{value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishSuccess}
              style={{
                width: '100%', height: '48px', backgroundColor: '#000', color: '#fff',
                border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.88rem', letterSpacing: '0.04em',
                textTransform: 'uppercase', fontFamily: 'var(--font-display)'
              }}
            >
              Continue Shopping
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
