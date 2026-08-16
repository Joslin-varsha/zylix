import React, { useState, useEffect } from 'react';
import { Search, Loader2, Download, Package, Clock, CheckCircle2, XCircle, AlertCircle, ShoppingCart } from 'lucide-react';

const calculateShipping = (zip, subtotal) => {
  if (subtotal > 5000) return 0;
  if (!zip || zip.trim().length < 6) return null;

  const cleanZip = zip.trim();
  const firstDigit = cleanZip.charAt(0);

  switch (firstDigit) {
    case '6': return 50;  // South (TN, Kerala)
    case '5': return 70;  // KA, AP, TS
    case '4': return 100; // MH, MP, Goa
    case '3': return 110; // GJ, RJ
    case '1':
    case '2': return 130; // North
    case '7':
    case '8': return 150; // East
    default:  return 120;
  }
};

export default function MyOrders({ user, setActiveTab }) {
  const [email, setEmail] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [overrideUserSession, setOverrideUserSession] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quote Payment checkout states
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [activeQuoteToPay, setActiveQuoteToPay] = useState(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [payError, setPayError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

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
              setPayError('');
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

  const handleOpenShippingModal = (quote) => {
    setActiveQuoteToPay(quote);
    setShippingDetails(prev => ({
      ...prev,
      fullName: user?.name || prev.fullName || ''
    }));
    setShowShippingModal(true);
    setPayError('');
  };

  const handleCloseShippingModal = () => {
    setShowShippingModal(false);
    setActiveQuoteToPay(null);
    setPayError('');
  };

  const handlePayQuoteSubmit = async (e) => {
    e.preventDefault();
    setPayError('');

    const { fullName, phone, address, city, state, zip } = shippingDetails;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      setPayError('Please fill in all shipping fields.');
      return;
    }

    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      setPayError('Please enter a valid 10-digit phone number.');
      return;
    }

    const zipClean = zip.replace(/\D/g, '');
    if (zipClean.length !== 6) {
      setPayError('Please enter a valid 6-digit ZIP code.');
      return;
    }

    const quoteSubtotal = activeQuoteToPay?.price_estimate || 0;
    const quoteShipping = calculateShipping(shippingDetails.zip, quoteSubtotal);
    const finalQuoteTotal = quoteSubtotal + (quoteShipping ?? 0);

    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} - ${zipClean}`;
    setProcessingPayment(true);

    try {
      // 1. Create order on backend with final amount including pincode shipping
      const createRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalQuoteTotal),
          email: user.email,
          name: fullName.trim()
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create payment order.');

      // 2. Check Sandbox mode
      if (createData.sandbox) {
        const verifyRes = await fetch(`${API_BASE}/api/payment/verify-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quoteId: activeQuoteToPay.id,
            razorpay_order_id: createData.orderId,
            razorpay_payment_id: `pay_sandbox_${Date.now()}`,
            razorpay_signature: 'sandbox_signature',
            customerPhone: phoneClean,
            shippingAddress: fullShippingAddress,
            sandbox: true
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed.');

        fetchCustomerOrders(email);
        handleCloseShippingModal();
        alert('Payment successful (Sandbox)! Custom print job is now in production.');
        setProcessingPayment(false);
        return;
      }

      // 3. Launch Razorpay Checkout Modal
      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency,
        name: 'Zylix 3D',
        description: `Custom Quote Payment - ${activeQuoteToPay.id}`,
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
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify-quote`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quoteId: activeQuoteToPay.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerPhone: phoneClean,
                shippingAddress: fullShippingAddress
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed.');

            fetchCustomerOrders(email);
            handleCloseShippingModal();
            alert('Payment successful! Your custom order has started production.');
          } catch (err) {
            console.error(err);
            alert('Payment was received but order approval failed. Please contact support.');
          }
          setProcessingPayment(false);
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setPayError(err.message);
      setProcessingPayment(false);
    }
  };

  // If the user is logged in, auto-fetch their orders on mount
  useEffect(() => {
    if (user && user.email && !overrideUserSession) {
      setEmail(user.email);
      fetchCustomerOrders(user.email);
    }
  }, [user, overrideUserSession]);

  // Reset override state when user logs out
  useEffect(() => {
    if (!user) {
      setOverrideUserSession(false);
      setEmail('');
      setQuotes([]);
      setSearched(false);
    }
  }, [user]);

  const fetchCustomerOrders = async (targetEmail) => {
    if (!targetEmail) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const response = await fetch(`${API_BASE}/api/quotes?email=${encodeURIComponent(targetEmail.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve orders from the server.');
      }
      const data = await response.json();
      setQuotes(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Please check if the backend is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }
    fetchCustomerOrders(email);
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const badges = {
      Pending: {
        text: 'Reviewing Specifications',
        bg: '#fffbeb',
        color: '#d97706',
        border: '#fde68a',
        icon: <Clock size={13} className="animate-pulse" />
      },
      Quoted: {
        text: 'Quote Prepared',
        bg: '#eff6ff',
        color: '#2563eb',
        border: '#bfdbfe',
        icon: <Package size={13} />
      },
      Approved: {
        text: 'In Production',
        bg: '#ecfdf5',
        color: '#10b981',
        border: '#a7f3d0',
        icon: <CheckCircle2 size={13} />
      },
      Completed: {
        text: 'Completed - Ready to Ship',
        bg: '#dcfce7',
        color: '#15803d',
        border: '#86efac',
        icon: <CheckCircle2 size={13} />
      },
      Dispatched: {
        text: 'Out for Delivery',
        bg: '#e0f2fe',
        color: '#0369a1',
        border: '#7dd3fc',
        icon: <Package size={13} />
      },
      Delivered: {
        text: 'Order Delivered',
        bg: '#f0fdf4',
        color: '#16a34a',
        border: '#bbf7d0',
        icon: <CheckCircle2 size={13} />
      },
      Declined: {
        text: 'Cancelled',
        bg: '#fef2f2',
        color: '#ef4444',
        border: '#fca5a5',
        icon: <XCircle size={13} />
      }
    };

    const config = badges[status] || badges.Pending;

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.74rem',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  // Service Type Badge Helper
  const getServiceTypeLabel = (type) => {
    switch (type) {
      case 'slicer': return '📐 CAD Slicer Print';
      case 'designer': return '🎨 Custom 3D Design';
      case 'spareparts': return '⚙️ Spare Part Re-creation';
      case 'prototype': return '🔬 Prototype Lab';
      case 'order': return '🛒 E-Store Purchase';
      default: return '📦 Custom Request';
    }
  };

  return (
    <div className="orders-page-container">
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '3rem' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ORDER TRACKING</span>
        <h1 className="orders-title" style={{ fontSize: isMobile ? '1.4rem' : '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>My Custom Quotes & Orders</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
          {user && !overrideUserSession
            ? `Viewing custom 3D printing and prototyping quote requests submitted by you.`
            : `Enter the email address you used during submission to track status, download file attachments, and view price estimates.`
          }
        </p>
      </div>

      {/* Search Bar Form (Only shown for guests or if user chooses to search guest email) */}
      {(!user || overrideUserSession) && (
        <div className="glass-panel" style={{
          maxWidth: '550px',
          margin: isMobile ? '0 auto 2rem' : '0 auto 3.5rem',
          padding: isMobile ? '1rem' : '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Registered Email Address
              </label>
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setOverrideUserSession(false);
                    setEmail(user.email);
                    setSearched(false);
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-color, #2563eb)', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Back to My Account
                </button>
              )}
            </div>
            <div className="orders-search-box" style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ flex: 1, height: '42px', borderRadius: '6px', fontSize: '0.85rem' }}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ height: '42px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                <span>Track Orders</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Alert Box */}
      {error && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 2rem',
          padding: '1rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Orders List Container */}
      {searched && !loading && (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: '800', color: '#1e293b' }}>
              Submissions ({quotes.length})
            </h2>
            <button
              onClick={() => fetchCustomerOrders(email)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem', height: '32px', borderRadius: '6px' }}
            >
              🔄 Refresh List
            </button>
          </div>

          {quotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: isMobile ? '2.5rem 1rem' : '4rem 2rem', border: '1px dashed #cbd5e1', borderRadius: '12px', background: '#fafafa' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#334155', margin: 0 }}>No Quote Submissions Found</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                We couldn't find any Slicer, Custom Design, Spare Parts, or Prototype requests linked to **{email}**.
              </p>
              <button
                onClick={() => setActiveTab('ailab')}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Submit A Quote Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.25rem' : '2rem' }}>
              {quotes.map((quote) => {
                // Determine item rows for this quote/order
                const isCatalogOrder = quote.type === 'order' && Array.isArray(quote.extra_data?.items);
                const orderItems = isCatalogOrder ? quote.extra_data.items : [quote];

                const getItemThumbnail = (q, item = null) => {
                  if (item?.image || item?.image_url || item?.img) {
                    return item.image || item.image_url || item.img;
                  }
                  if (q.file_url && q.file_name?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                    return q.file_url;
                  }
                  switch (q.type) {
                    case 'designer': return '/images/categories/keychains.jpg';
                    case 'spareparts': return '/images/categories/holders.jpg';
                    case 'prototype': return '/images/categories/gifts.jpg';
                    case 'slicer': return '/images/categories/stencils.jpg';
                    default: return '/images/categories/keychains.jpg';
                  }
                };

                const getItemTitle = (q, item = null) => {
                  if (q.type === 'order' && item) return item.name;
                  if (q.type === 'designer') {
                    const pType = q.extra_data?.productType === 'other' ? q.extra_data?.customProductType : q.extra_data?.productType;
                    const text = q.extra_data?.nameText;
                    return `Custom 3D ${pType || 'Design'} ${text ? `("${text}")` : ''}`;
                  }
                  if (q.type === 'spareparts') return q.extra_data?.partName || 'Spare Part Re-Creation';
                  if (q.type === 'prototype') return q.extra_data?.projectName || 'Prototype Lab Request';
                  if (q.type === 'slicer') return q.file_name || 'CAD Slicer Model Print';
                  return 'Custom 3D Order';
                };

                return (
                  <div
                    key={quote.id}
                    className="glass-panel animate-fadeIn"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Card Top Order Header Bar */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: isMobile ? '0.85rem 1rem' : '1rem 1.5rem',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '0.5rem' : '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={quote.status} />
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Ref</span>
                          <div style={{ fontFamily: 'monospace', fontSize: isMobile ? '0.88rem' : '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                            {quote.id}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                          📅 {new Date(quote.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Card Middle: Product Item List */}
                    <div style={{ padding: isMobile ? '1rem' : '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {orderItems.map((item, idx) => {
                        const thumbImg = getItemThumbnail(quote, isCatalogOrder ? item : null);
                        const title = getItemTitle(quote, isCatalogOrder ? item : null);

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              gap: isMobile ? '0.75rem' : '1.25rem',
                              alignItems: 'center',
                              padding: isMobile ? '0.75rem' : '1rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid #f1f5f9',
                              borderRadius: '12px',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            {/* Product Thumbnail */}
                            <div style={{
                              width: isMobile ? '56px' : '72px',
                              height: isMobile ? '56px' : '72px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              flexShrink: 0
                            }}>
                              <img
                                src={thumbImg}
                                alt={title}
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/categories/keychains.jpg'; }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            {/* Product Details & Specs */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                  {getServiceTypeLabel(quote.type)}
                                </span>
                              </div>

                              <h4 style={{ fontSize: isMobile ? '0.88rem' : '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: '1.35' }}>
                                {title}
                              </h4>

                              {/* Specs Pill List */}
                              <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.75rem', marginTop: '2px' }}>
                                {quote.type === 'designer' && (
                                  <>
                                    {quote.extra_data?.nameText && <span>Text: <strong style={{ color: '#0f172a' }}>"{quote.extra_data.nameText}"</strong></span>}
                                    {quote.color && <span>Color: <strong style={{ color: '#0f172a' }}>{quote.color}</strong></span>}
                                    {quote.extra_data?.designerSize && <span>Size: <strong style={{ color: '#0f172a' }}>{quote.extra_data.designerSize}</strong></span>}
                                  </>
                                )}

                                {quote.type === 'slicer' && (
                                  <>
                                    <span>Material: <strong style={{ color: '#0f172a' }}>{quote.material}</strong></span>
                                    <span>Color: <strong style={{ color: '#0f172a' }}>{quote.color}</strong></span>
                                    <span>Qty: <strong style={{ color: '#0f172a' }}>{quote.quantity} pcs</strong></span>
                                  </>
                                )}

                                {quote.type === 'spareparts' && quote.extra_data?.dimensions && (
                                  <span>Dimensions: <strong style={{ color: '#0f172a' }}>{quote.extra_data.dimensions.length}×{quote.extra_data.dimensions.width}×{quote.extra_data.dimensions.height} mm</strong></span>
                                )}

                                {quote.type === 'prototype' && (
                                  <>
                                    <span>Category: <strong style={{ color: '#0f172a' }}>{quote.extra_data?.projectType}</strong></span>
                                    {quote.extra_data?.requiredDate && <span>Required By: <strong style={{ color: '#0f172a' }}>{quote.extra_data.requiredDate}</strong></span>}
                                  </>
                                )}

                                {isCatalogOrder && item.isCustom && (
                                  <span>Custom: <strong style={{ color: '#0f172a' }}>"{item.customText}"</strong> ({item.textColor} / {item.baseColor})</span>
                                )}
                              </div>

                              {quote.notes && (
                                <div style={{ fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                                  Note: "{quote.notes}"
                                </div>
                              )}
                            </div>

                            {/* Item Price Tag */}
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontSize: isMobile ? '0.95rem' : '1.15rem', fontWeight: '900', color: '#000000' }}>
                                {isCatalogOrder
                                  ? `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
                                  : quote.price_estimate
                                  ? `₹${quote.price_estimate.toLocaleString('en-IN')}`
                                  : <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '700', backgroundColor: '#fffbeb', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fde68a' }}>Reviewing</span>
                                }
                              </div>
                              {isCatalogOrder && item.quantity > 1 && (
                                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Qty: {item.quantity}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Bottom Footer: Files & CTA Actions */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: isMobile ? '0.85rem 1rem' : '1rem 1.5rem',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: isMobile ? 'stretch' : 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '1rem'
                    }}>
                      {/* Attachments list / Order Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {isCatalogOrder ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.72rem', color: '#475569' }}>
                            <div><strong style={{ color: '#0f172a' }}>Receipt Ref:</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: '700' }}>{quote.extra_data?.receiptId}</span></div>
                            {quote.extra_data?.shippingAddress && (
                              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '320px' }}>
                                📍 <span style={{ color: '#64748b' }}>Deliver to:</span> {quote.extra_data.shippingAddress}
                              </div>
                            )}
                          </div>
                        ) : quote.extra_data?.files && quote.extra_data.files.length > 0 ? (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {quote.extra_data.files.map((fileObj, idx) => (
                              <a
                                key={idx}
                                href={fileObj.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  color: '#2563eb',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  textDecoration: 'none'
                                }}
                              >
                                📎 {fileObj.fileName} <Download size={11} />
                              </a>
                            ))}
                          </div>
                        ) : quote.file_url ? (
                          <a
                            href={quote.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textDecoration: 'none'
                            }}
                          >
                            📎 {quote.file_name} <Download size={11} />
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No file attachments</span>
                        )}
                      </div>

                      {/* Total Amount & Action CTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', gap: '1rem' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em', display: 'block' }}>
                            {quote.price_estimate ? 'Quoted Estimate (+ Shipping)' : 'Total Amount'}
                          </span>
                          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
                            {quote.price_estimate ? `₹${quote.price_estimate.toLocaleString('en-IN')}` : (isCatalogOrder ? `₹${quote.extra_data?.total?.toLocaleString('en-IN')}` : 'Calculating...')}
                          </span>
                        </div>

                        {quote.status === 'Quoted' && quote.price_estimate ? (
                          <button
                            onClick={() => handleOpenShippingModal(quote)}
                            className="btn-primary"
                            style={{
                              height: '40px',
                              padding: '0 1.25rem',
                              fontSize: '0.8rem',
                              fontWeight: '900',
                              letterSpacing: '0.03em',
                              textTransform: 'uppercase',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}
                          >
                            ⚡ PAY NOW (₹{quote.price_estimate.toLocaleString('en-IN')})
                          </button>
                        ) : quote.status === 'Completed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '8px' }}>
                            <CheckCircle2 size={14} /> 🎉 Production Completed (Ready to Ship)
                          </div>
                        ) : quote.status === 'Dispatched' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: '800', color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', padding: '6px 12px', borderRadius: '8px' }}>
                            <Package size={14} /> 🚚 Out For Delivery
                          </div>
                        ) : quote.status === 'Delivered' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: '800', color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px' }}>
                            <CheckCircle2 size={14} /> ✅ Order Delivered
                          </div>
                        ) : quote.status === 'Approved' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: '800', color: '#16a34a', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '8px' }}>
                            <CheckCircle2 size={14} /> Production In Progress
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            ⏳ Under Review
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Spacing bottom */}
      <div style={{ height: '3rem' }} />

      {/* Shipping Details Modal for Quote Checkout */}
      {showShippingModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 300,
          padding: isMobile ? '1rem' : '0',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: isMobile ? '1.25rem' : '2rem',
            width: '100%',
            maxWidth: '520px',
            maxHeight: isMobile ? '90vh' : 'auto',
            overflowY: isMobile ? 'auto' : 'visible',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            animation: 'slideUpOverlay 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#111' }}>
                Delivery Details
              </h3>
              <button 
                onClick={handleCloseShippingModal} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: '1rem', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {payError && (
              <div style={{
                backgroundColor: '#fff5f5',
                color: '#e53e3e',
                border: '1px solid #fed7d7',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}>
                {payError}
              </div>
            )}

            <form onSubmit={handlePayQuoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Recipient Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Vipin Kumar"
                    value={shippingDetails.fullName}
                    onChange={e => setShippingDetails(prev => ({ ...prev, fullName: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={shippingDetails.phone}
                    onChange={e => setShippingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Street Address *</label>
                <input
                  type="text"
                  placeholder="Flat / House No. / Building / Street"
                  value={shippingDetails.address}
                  onChange={e => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field"
                  style={{ height: '38px', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: '0.75rem' }}>
                {/* City */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>City *</label>
                  <input
                    type="text"
                    placeholder="Chennai"
                    value={shippingDetails.city}
                    onChange={e => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                </div>

                {/* State */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>State *</label>
                  <input
                    type="text"
                    placeholder="Tamil Nadu"
                    value={shippingDetails.state}
                    onChange={e => setShippingDetails(prev => ({ ...prev, state: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                </div>

                {/* ZIP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: isMobile ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ZIP / PIN Code *</label>
                  <input
                    type="text"
                    placeholder="6-digit ZIP"
                    value={shippingDetails.zip}
                    onChange={e => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                  {shippingDetails.zip?.trim().length === 6 && (
                    <div style={{ marginTop: '0.35rem', padding: '0.45rem 0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.74rem', color: '#15803d', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🚚 Shipping Fee for PIN {shippingDetails.zip.trim()}: <strong>{calculateShipping(shippingDetails.zip, activeQuoteToPay?.price_estimate || 0) === 0 ? 'FREE (Order > ₹5000)' : `+ ₹${calculateShipping(shippingDetails.zip, activeQuoteToPay?.price_estimate || 0)}`}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping & Price Breakdown */}
              {(() => {
                const sub = activeQuoteToPay?.price_estimate || 0;
                const ship = calculateShipping(shippingDetails.zip, sub);
                const tot = sub + (ship ?? 0);
                return (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Custom Quote Estimate</span>
                      <strong style={{ color: '#0f172a' }}>₹{sub.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Shipping Fee ({shippingDetails.zip?.trim().length === 6 ? `PIN ${shippingDetails.zip}` : 'Enter PIN'})</span>
                      <strong style={{ color: ship === 0 ? '#16a34a' : '#0f172a' }}>
                        {ship === 0 ? 'FREE' : ship === null ? 'Enter 6-digit PIN' : `+ ₹${ship}`}
                      </strong>
                    </div>
                    <div style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: '0.45rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a' }}>Total Amount Payable</span>
                      <span style={{ fontWeight: '900', color: '#000000', fontSize: '1.15rem' }}>₹{Math.round(tot).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleCloseShippingModal}
                  style={{
                    flex: 1, height: '42px', backgroundColor: '#f5f5f5', color: '#333',
                    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                    fontWeight: '700', fontSize: '0.82rem', fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayment}
                  style={{
                    flex: 1, height: '42px', backgroundColor: '#000', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: processingPayment ? 'not-allowed' : 'pointer',
                    fontWeight: '800', fontSize: '0.82rem', letterSpacing: '0.04em',
                    textTransform: 'uppercase', opacity: processingPayment ? 0.7 : 1,
                    fontFamily: 'inherit'
                  }}
                >
                  {processingPayment ? 'Processing...' : `Pay ₹${Math.round((activeQuoteToPay?.price_estimate || 0) + (calculateShipping(shippingDetails.zip, activeQuoteToPay?.price_estimate || 0) ?? 0)).toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
