import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CreditCard, Shield, Truck, CheckCircle2, 
  MapPin, User, Phone, Mail, ShoppingBag, Plus, Minus, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const calculateShipping = (zip, subtotal) => {
  return 0; // Set to 0 for testing free shipping
};

export default function CheckoutPage({ buyNowItem, cartItems, user, setActiveTab, onClearCart }) {
  // Determine items to checkout: single Buy Now item or cart items
  const [items, setItems] = useState(() => {
    if (buyNowItem) return [{ ...buyNowItem }];
    return cartItems && cartItems.length > 0 ? [...cartItems] : [];
  });

  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state if buyNowItem changes
  useEffect(() => {
    if (buyNowItem) {
      setItems([{ ...buyNowItem }]);
    } else if (cartItems && cartItems.length > 0) {
      setItems([...cartItems]);
    }
  }, [buyNowItem, cartItems]);

  // Auto-fill city/state when PIN code is typed
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
          }
        } catch (err) {
          console.error('Error fetching pincode data:', err);
        }
      };
      fetchPincodeData();
    }
  }, [shippingDetails.zip]);

  const updateQuantity = (idx, delta) => {
    setItems(prev => {
      const updated = [...prev];
      const newQty = Math.max(1, updated[idx].quantity + delta);
      updated[idx] = { ...updated[idx], quantity: newQty };
      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = calculateShipping(shippingDetails.zip, subtotal);
  const finalTotal = subtotal + (shipping ?? 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      setValidationError('Please sign in to place an order.');
      setActiveTab('login');
      return;
    }

    setValidationError('');
    const { fullName, phone, address, city, state, zip } = shippingDetails;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setValidationError('Please fill in all required delivery fields.');
      return;
    }

    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const zipClean = zip.replace(/\D/g, '');
    if (zipClean.length !== 6) {
      setValidationError('Please enter a valid 6-digit Pincode.');
      return;
    }

    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} - ${zipClean}`;
    setIsProcessing(true);

    try {
      // 1. Create Razorpay Payment Order
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

      // 2. Sandbox mode check vs live Razorpay
      if (createData.sandbox) {
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
            items: items,
            totalAmount: Math.round(finalTotal),
            shippingAddress: fullShippingAddress,
            sandbox: true
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          if (onClearCart) onClearCart();
          setOrderSuccess({
            ticketId: verifyData.ticketId,
            receiptId: verifyData.receiptId
          });
        } else {
          throw new Error(verifyData.error || 'Order placement failed.');
        }
        setIsProcessing(false);
        return;
      }

      // Live Razorpay popup
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'Zylix 3D Store',
        description: `Order Checkout (${items.length} items)`,
        order_id: createData.orderId,
        prefill: {
          name: fullName.trim(),
          email: user.email,
          contact: phoneClean
        },
        theme: { color: '#000000' },
        handler: async function (response) {
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
                items: items,
                totalAmount: Math.round(finalTotal),
                shippingAddress: fullShippingAddress
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              if (onClearCart) onClearCart();
              setOrderSuccess({
                ticketId: verifyData.ticketId,
                receiptId: verifyData.receiptId
              });
            } else {
              alert('Payment verification failed: ' + (verifyData.error || 'Unknown error'));
            }
          } catch (err) {
            console.error('Payment callback error:', err);
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
      console.error('Payment execution error:', err);
      setValidationError(err.message);
      setIsProcessing(false);
    }
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={44} color="#ffffff" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Thank you for ordering with Zylix 3D. Your order details have been saved and dispatched for production.
            </p>
          </div>

          <div style={{ width: '100%', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Order Ticket ID</span>
              <span style={{ fontWeight: '800', color: '#2563eb' }}>{orderSuccess.ticketId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Receipt ID</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>{orderSuccess.receiptId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Amount Paid</span>
              <span style={{ fontWeight: '900', color: '#0f172a' }}>₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Est. Delivery</span>
              <span style={{ fontWeight: '700', color: '#16a34a' }}>2–5 Business Days</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button onClick={() => setActiveTab('orders')} className="btn-secondary" style={{ flex: 1, height: '46px', fontWeight: '800' }}>
              View My Orders
            </button>
            <button onClick={() => setActiveTab('shop')} className="btn-primary" style={{ flex: 1, height: '46px', fontWeight: '800' }}>
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CHECKOUT PAGE
  if (!items || items.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <ShoppingBag size={32} color="#94a3b8" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>No item selected for checkout</h2>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.5rem' }}>Please select a product or click Buy Now to proceed.</p>
        <button onClick={() => setActiveTab('shop')} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '1rem 0.85rem 5.5rem' : '1.5rem 1rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: isMobile ? '1.25rem' : '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', gap: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('shop')}
          style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.82rem' }}
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '800', fontSize: isMobile ? '0.78rem' : '0.82rem' }}>
          <Shield size={16} /> 256-Bit SSL Encrypted Checkout
        </div>
      </div>

      {validationError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.84rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {validationError}
        </div>
      )}

      {/* Main Grid: Shipping Details + Order Summary */}
      <div className="checkout-main-grid" style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', gap: isMobile ? '1.25rem' : '2rem', alignItems: 'start' }}>
        
        {/* ─── SHIPPING & DELIVERY DETAILS ─── */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', flex: 1, width: '100%' }}>
          <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.15rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2563eb" /> Shipping & Delivery Details
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Rahul Sharma"
                  value={shippingDetails.fullName}
                  onChange={e => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                  style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.88rem' }}
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>Mobile Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={shippingDetails.phone}
                  onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value.replace(/\D/g, '') })}
                  style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.88rem', letterSpacing: '0.05em' }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>Street / House Address *</label>
              <input
                type="text"
                className="input-field"
                placeholder="House / Flat No., Road, Area, Landmark"
                value={shippingDetails.address}
                onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                style={{ height: '44px', fontSize: '0.88rem' }}
              />
            </div>

            {/* Pincode + City + State Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>PIN Code *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="600001"
                  maxLength={6}
                  value={shippingDetails.zip}
                  onChange={e => setShippingDetails({ ...shippingDetails, zip: e.target.value.replace(/\D/g, '') })}
                  style={{ height: '44px', fontSize: '0.88rem', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>City *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="City"
                  value={shippingDetails.city}
                  onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  style={{ height: '44px', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>State *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="State"
                  value={shippingDetails.state}
                  onChange={e => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                  style={{ height: '44px', fontSize: '0.88rem' }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* ─── ORDER SUMMARY & PAYMENT ─── */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: isMobile ? '1.25rem' : '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: isMobile ? 'static' : 'sticky', top: '90px', width: isMobile ? '100%' : '400px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            🛒 Order Summary ({items.length})
          </h2>

          {/* List of Items being purchased */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '260px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '4px' }}>
            {items.map((item, idx) => {
              const imgSrc = item.image || item.image_url || item.img || item.picture || '/logo.png';
              return (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8fafc', padding: '0.65rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <img
                    src={imgSrc}
                    alt={item.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
                    style={{
                      width: '52px',
                      height: '52px',
                      minWidth: '52px',
                      minHeight: '52px',
                      flexShrink: 0,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    {item.isCustom && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        "{item.customText}" · {item.textColor} / {item.baseColor}
                      </div>
                    )}
                    <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#000', marginTop: '2px' }}>₹{item.price.toLocaleString('en-IN')}</div>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', flexShrink: 0 }}>
                    <button onClick={() => updateQuantity(idx, -1)} style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>-</button>
                    <span style={{ width: '24px', textAlign: 'center', fontSize: '0.78rem', fontWeight: '800' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} style={{ width: '24px', height: '24px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b' }}>
              <span>Shipping Fee</span>
              <span style={{ fontWeight: '700', color: shipping === 0 ? '#16a34a' : '#0f172a' }}>
                {shipping === 0 ? 'FREE' : shipping === null ? 'Enter PIN code' : `₹${shipping}`}
              </span>
            </div>

            <div style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: '0.75rem', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>Total Amount</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#000000' }}>₹{Math.round(finalTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Pay Button (Desktop only, mobile uses sticky bottom bar) */}
          {!isMobile && (
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                fontWeight: '900',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '1.25rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000000'; }}
            >
              <CreditCard size={18} /> {isProcessing ? 'Processing Order...' : `Pay ₹${Math.round(finalTotal).toLocaleString('en-IN')} & Place Order`}
            </button>
          )}

          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Truck size={14} color="#16a34a" /> Fast Dispatch in 24 Hours
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar on Mobile */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          padding: '0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Amount</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.1' }}>
              ₹{Math.round(finalTotal).toLocaleString('en-IN')}
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            style={{
              flex: 1,
              maxWidth: '230px',
              height: '44px',
              borderRadius: '10px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              fontWeight: '900',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CreditCard size={16} /> {isProcessing ? 'Processing...' : 'Pay & Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}
