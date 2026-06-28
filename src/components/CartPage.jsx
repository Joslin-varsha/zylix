import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, CheckCircle2, Shield, Truck, Package } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const calculateShipping = (zip, subtotal) => {
  if (subtotal > 5000) return 0;
  if (!zip || zip.trim().length < 6) return 150; // default shipping estimate

  const cleanZip = zip.trim();
  const firstDigit = cleanZip.charAt(0);

  switch (firstDigit) {
    case '6': // Local Region (Tamil Nadu, Kerala)
      return 50;
    case '5': // South-Central (Karnataka, AP, Telangana)
      return 70;
    case '4': // West-Central (Maharashtra, Goa, MP)
      return 100;
    case '3': // West (Gujarat, Rajasthan)
      return 110;
    case '1': // North (Delhi, Haryana, Punjab)
    case '2': // North-Central (UP, Uttarakhand)
      return 130;
    case '7': // East (WB, Odisha)
    case '8': // East-Central (Bihar, Jharkhand)
      return 150;
    default: // North-East / Remote (starts with 9 or other)
      return 120;
  }
};

export default function CartPage({
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  user,
  setActiveTab
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // { ticketId, receiptId }
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const zip = shippingDetails.zip.trim();
    if (zip.length === 6 && /^\d+$/.test(zip)) {
      const fetchPincodeData = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/pincode/${zip}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setShippingDetails(prev => ({
                ...prev,
                city: data.city,
                state: data.state
              }));
              setValidationError('');
            }
          } else {
            console.log('Pincode not found in database.');
          }
        } catch (err) {
          console.error('Error fetching pincode data:', err);
        }
      };
      fetchPincodeData();
    }
  }, [shippingDetails.zip]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(shippingDetails.zip, subtotal);
  const finalTotal = subtotal + shipping;

  const handlePay = async () => {
    if (!user) {
      alert('Please sign in to place an order.');
      setActiveTab('login');
      return;
    }

    setValidationError('');

    const { fullName, phone, address, city, state, zip } = shippingDetails;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setValidationError('Please fill in all shipping and delivery fields.');
      return;
    }

    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      setValidationError('Please enter a valid 10-digit phone number.');
      return;
    }

    const zipClean = zip.replace(/\D/g, '');
    if (zipClean.length !== 6) {
      setValidationError('Please enter a valid 6-digit ZIP code.');
      return;
    }

    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} - ${zipClean}`;

    setIsProcessing(true);

    try {
      // Step 1: Create payment order on backend
      const createRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal),
          email: user.email,
          name: fullName.trim()
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create payment order.');

      // Step 2: Check if sandbox mode or real Razorpay
      if (createData.sandbox) {
        // Sandbox mode — skip Razorpay modal, go straight to verify
        const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: createData.orderId,
            razorpay_payment_id: `pay_sandbox_${Date.now()}`,
            razorpay_signature: 'sandbox_signature',
            customerName: fullName.trim(),
            customerEmail: user.email,
            customerPhone: phoneClean,
            items: cartItems,
            totalAmount: Math.round(finalTotal),
            shippingAddress: fullShippingAddress,
            sandbox: true
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Sandbox order failed.');

        setOrderSuccess({ ticketId: verifyData.ticketId, receiptId: verifyData.receiptId });
        onClearCart();
        setIsProcessing(false);
        return;
      }

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'Zylix 3D',
        description: `Order — ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`,
        order_id: createData.orderId,
        prefill: {
          name: fullName.trim(),
          email: user.email || '',
          contact: phoneClean
        },
        theme: {
          color: '#000000',
          backdrop_color: 'rgba(0,0,0,0.6)'
        },
        handler: async function (response) {
          // Payment successful — verify on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerName: fullName.trim(),
                customerEmail: user.email,
                customerPhone: phoneClean,
                items: cartItems,
                totalAmount: Math.round(finalTotal),
                shippingAddress: fullShippingAddress
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed.');

            setOrderSuccess({ ticketId: verifyData.ticketId, receiptId: verifyData.receiptId });
            onClearCart();
          } catch (err) {
            console.error(err);
            alert('Payment was received but order saving failed. Please contact support.');
          }
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message);
      setIsProcessing(false);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUCCESS SCREEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (orderSuccess) {
    return (
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', animation: 'fadeIn 0.4s ease'
      }}>
        <div style={{
          maxWidth: '480px', width: '100%', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem'
        }}>
          {/* Success icon */}
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00c853, #00e676)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,200,83,0.3)',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <CheckCircle2 size={44} style={{ color: '#fff' }} />
          </div>

          <div>
            <h2 style={{
              fontSize: '1.6rem', fontWeight: '900', color: '#111',
              fontFamily: 'var(--font-display)', marginBottom: '0.5rem'
            }}>Order Confirmed!</h2>
            <p style={{ fontSize: '0.88rem', color: '#888', lineHeight: '1.6', maxWidth: '320px', margin: '0 auto' }}>
              Your payment has been processed successfully. We're preparing your items for dispatch.
            </p>
          </div>

          {/* Receipt card */}
          <div style={{
            width: '100%', background: '#fafafa', border: '1px solid #ebebeb',
            borderRadius: '16px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.8rem'
          }}>
            {[
              { label: 'Order ID', value: orderSuccess.ticketId, bold: true, accent: true },
              { label: 'Receipt ID', value: orderSuccess.receiptId },
              { label: 'Amount Paid', value: `₹${Math.round(finalTotal).toLocaleString('en-IN')}`, bold: true },
              { label: 'Payment Method', value: 'Razorpay' },
              { label: 'Est. Delivery', value: '2–5 working days' },
            ].map(({ label, value, bold, accent }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#999' }}>{label}</span>
                <span style={{
                  color: accent ? '#00c853' : '#111',
                  fontWeight: bold ? '800' : '500',
                  fontFamily: bold ? 'var(--font-display)' : 'inherit'
                }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button
              onClick={() => { setOrderSuccess(null); setActiveTab('orders'); }}
              style={{
                flex: 1, height: '48px', backgroundColor: '#f5f5f5', color: '#333',
                border: '1px solid #e0e0e0', borderRadius: '12px', cursor: 'pointer',
                fontWeight: '700', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eee'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            >
              View My Orders
            </button>
            <button
              onClick={() => { setOrderSuccess(null); setActiveTab('shop'); }}
              style={{
                flex: 1, height: '48px', backgroundColor: '#000', color: '#fff',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.82rem', letterSpacing: '0.03em',
                textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#000'}
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EMPTY CART
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (cartItems.length === 0) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '3rem',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <ShoppingBag size={36} style={{ color: '#ccc' }} />
        </div>
        <h2 style={{
          fontSize: '1.3rem', fontWeight: '800', color: '#222',
          fontFamily: 'var(--font-display)', marginBottom: '0.5rem'
        }}>Your cart is empty</h2>
        <p style={{ fontSize: '0.88rem', color: '#999', marginBottom: '2rem', maxWidth: '300px', textAlign: 'center', lineHeight: '1.6' }}>
          Browse our store and add some amazing 3D printed products to your cart.
        </p>
        <button
          onClick={() => setActiveTab('shop')}
          style={{
            height: '48px', padding: '0 2rem', backgroundColor: '#000', color: '#fff',
            border: 'none', borderRadius: '12px', cursor: 'pointer',
            fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.04em',
            textTransform: 'uppercase', fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#000'}
        >
          <ArrowLeft size={16} /> Browse Store
        </button>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CART PAGE WITH ITEMS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem'
      }}>
        <button
          onClick={() => setActiveTab('shop')}
          style={{
            width: '38px', height: '38px', borderRadius: '10px',
            border: '1px solid #e0e0e0', backgroundColor: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
        >
          <ArrowLeft size={16} style={{ color: '#555' }} />
        </button>
        <div>
          <h1 style={{
            fontSize: '1.4rem', fontWeight: '900', color: '#111',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.02em'
          }}>Shopping Cart</h1>
          <p style={{ fontSize: '0.78rem', color: '#999', marginTop: '2px' }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
      </div>

      {/* Main Grid: Items + Summary */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem',
        alignItems: 'start'
      }}>

        {/* ─── LEFT: Cart Items ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cartItems.map((item, index) => (
            <div key={index} style={{
              backgroundColor: '#fff', borderRadius: '14px',
              border: '1px solid #ebebeb', padding: '1rem',
              display: 'flex', gap: '1rem', alignItems: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s, border-color 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#ddd'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#ebebeb'; }}
            >
              {/* Thumbnail */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '10px',
                backgroundColor: '#f5f5f5', overflow: 'hidden', flexShrink: 0,
                border: '1px solid #eee'
              }}>
                {item.isCustom ? (
                  <div style={{
                    width: '100%', height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: '800', color: '#555',
                    textAlign: 'center', backgroundColor: '#f0f0f0'
                  }}>
                    STL<br />PRINT
                  </div>
                ) : (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#111', lineHeight: '1.3' }}>
                  {item.name}
                </h3>
                {item.isCustom && (
                  <p style={{ fontSize: '0.72rem', color: '#999' }}>
                    {item.material} · {item.infill}% infill · {item.resolution}
                  </p>
                )}
                <p style={{ fontSize: '0.95rem', fontWeight: '800', color: '#000', fontFamily: 'var(--font-display)', marginTop: '0.2rem' }}>
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quantity controls */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0',
                border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden'
              }}>
                <button
                  onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                  style={{
                    width: '36px', height: '36px', border: 'none', backgroundColor: '#fafafa',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                >
                  <Minus size={14} style={{ color: '#555' }} />
                </button>
                <div style={{
                  width: '40px', height: '36px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.88rem', fontWeight: '700', color: '#111',
                  borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0',
                  backgroundColor: '#fff'
                }}>
                  {item.quantity}
                </div>
                <button
                  onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                  style={{
                    width: '36px', height: '36px', border: 'none', backgroundColor: '#fafafa',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fafafa'}
                >
                  <Plus size={14} style={{ color: '#555' }} />
                </button>
              </div>

              {/* Line total */}
              <div style={{
                minWidth: '90px', textAlign: 'right', fontSize: '1rem',
                fontWeight: '800', color: '#000', fontFamily: 'var(--font-display)'
              }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemoveItem(index)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: '1px solid #f0f0f0', backgroundColor: '#fff',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.borderColor = '#ffcccc'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#f0f0f0'; }}
              >
                <Trash2 size={14} style={{ color: '#cc4444' }} />
              </button>
            </div>
          ))}

          {/* Clear cart */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              onClick={onClearCart}
              style={{
                fontSize: '0.78rem', color: '#999', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: '600',
                textDecoration: 'underline', padding: '4px 0',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#cc4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#999'}
            >
              Clear entire cart
            </button>
          </div>

          {/* Shipping Details Card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            border: '1px solid #ebebeb',
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '800',
              color: '#111',
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '0.6rem',
              marginBottom: '0.2rem'
            }}>
              Shipping & Delivery Details
            </h3>

            {validationError && (
              <div style={{
                backgroundColor: '#fff5f5',
                color: '#e53e3e',
                border: '1px solid #fed7d7',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {validationError}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vipin Kumar"
                  value={shippingDetails.fullName}
                  onChange={e => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* Phone Number */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={shippingDetails.phone}
                  onChange={e => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Street Address *</label>
              <input
                type="text"
                placeholder="Flat / House No. / Building / Street"
                value={shippingDetails.address}
                onChange={e => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                className="input-field"
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem'
            }}>
              {/* City */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>City *</label>
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={shippingDetails.city}
                  onChange={e => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* State */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>State *</label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu"
                  value={shippingDetails.state}
                  onChange={e => setShippingDetails(prev => ({ ...prev, state: e.target.value }))}
                  className="input-field"
                />
              </div>

              {/* ZIP Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#666', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ZIP Code *</label>
                <input
                  type="text"
                  placeholder="6-digit ZIP"
                  value={shippingDetails.zip}
                  onChange={e => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Order Summary ─── */}
        <div style={{
          position: 'sticky', top: '100px',
          backgroundColor: '#fff', borderRadius: '18px',
          border: '1px solid #ebebeb', padding: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '1.25rem'
        }}>
          <h3 style={{
            fontSize: '0.95rem', fontWeight: '800', color: '#111',
            fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
            textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0',
            paddingBottom: '0.75rem'
          }}>
            Order Summary
          </h3>

          {/* Price breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <PriceRow label="Subtotal" value={`₹${subtotal.toLocaleString('en-IN')}`} />
            <PriceRow label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} accent={shipping === 0} />
            {shipping > 0 && (
              <p style={{ fontSize: '0.72rem', color: '#aaa', fontStyle: 'italic', marginTop: '-2px' }}>
                {shippingDetails.zip && shippingDetails.zip.trim().length >= 6 
                  ? `Calculated zone rate for pincode ${shippingDetails.zip.trim()}`
                  : 'Enter a 6-digit delivery pincode for zone-based shipping.'}
              </p>
            )}
            <div style={{ borderTop: '1px dashed #e5e5e5', marginTop: '0.3rem', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#000', fontFamily: 'var(--font-display)' }}>Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#000', fontFamily: 'var(--font-display)' }}>
                  ₹{Math.round(finalTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            style={{
              width: '100%', height: '54px', backgroundColor: '#000', color: '#fff',
              border: 'none', borderRadius: '14px', cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontWeight: '800', fontSize: '0.92rem', letterSpacing: '0.04em',
              textTransform: 'uppercase', fontFamily: 'var(--font-display)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              opacity: isProcessing ? 0.7 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = '#222'; }}
            onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.backgroundColor = '#000'; }}
          >
            {isProcessing ? (
              <>
                <div style={{
                  width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Pay ₹{Math.round(finalTotal).toLocaleString('en-IN')}
              </>
            )}
          </button>

          {/* Razorpay badge */}
          <p style={{
            fontSize: '0.7rem', color: '#bbb', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
          }}>
            <Shield size={11} /> Secured by Razorpay · 256-bit SSL
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem',
            borderTop: '1px solid #f0f0f0', paddingTop: '1rem'
          }}>
            {[
              { icon: <Truck size={15} />, label: 'Free Shipping', sub: 'Above ₹5,000' },
              { icon: <Shield size={15} />, label: 'Secure Payment', sub: 'Razorpay Gateway' },
              { icon: <Package size={15} />, label: 'Fast Dispatch', sub: '1–2 business days' },
              { icon: <CheckCircle2 size={15} />, label: 'Quality Check', sub: 'Every item inspected' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem', borderRadius: '10px', backgroundColor: '#fafafa'
              }}>
                <div style={{ color: '#888', flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#555' }}>{label}</p>
                  <p style={{ fontSize: '0.6rem', color: '#bbb' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive override for mobile */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          /* Stack the grid vertically on mobile */
          div[style*="gridTemplateColumns: '1fr 380px'"],
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Helper: Price Row ───
function PriceRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.84rem', color: '#888' }}>{label}</span>
      <span style={{
        fontSize: '0.88rem', fontWeight: '600',
        color: accent ? '#00c853' : '#333'
      }}>{value}</span>
    </div>
  );
}
