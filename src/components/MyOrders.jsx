import React, { useState, useEffect } from 'react';
import { Search, Loader2, Download, Package, Clock, CheckCircle2, XCircle, AlertCircle, ShoppingCart } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function MyOrders({ user, setActiveTab }) {
  const [email, setEmail] = useState('');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [overrideUserSession, setOverrideUserSession] = useState(false);

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

    const fullShippingAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} - ${zipClean}`;
    setProcessingPayment(true);

    try {
      // 1. Create order on backend
      const createRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeQuoteToPay.price_estimate,
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '70vh' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ORDER TRACKING</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>My Custom Quotes & Orders</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.9rem' }}>
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
          margin: '0 auto 3.5rem',
          padding: '1.5rem',
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                style={{ height: '42px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
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
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed #cbd5e1', borderRadius: '12px', background: '#fafafa' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {quotes.map((quote) => {
                // Check if file is image for preview
                const isImg = quote.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                
                return (
                  <div
                    key={quote.id}
                    className="glass-panel animate-fadeIn"
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.03)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Card Top Title Row */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ticket Reference</span>
                        <h3 style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '2px 0 0 0' }}>
                          {quote.id}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {new Date(quote.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <StatusBadge status={quote.status} />
                      </div>
                    </div>

                    {/* Card Inner Grid Details */}
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
                      
                      {/* Left: Spec Details */}
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                          Specifications
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <div><span style={{ color: '#64748b' }}>Service Mode:</span> <strong style={{ color: '#0f172a' }}>{getServiceTypeLabel(quote.type)}</strong></div>
                          
                          {/* CAD Print specs */}
                          {quote.type === 'slicer' && (
                            <>
                              <div><span style={{ color: '#64748b' }}>Material:</span> <strong style={{ color: '#0f172a' }}>{quote.material}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Filament Color:</span> <strong style={{ color: '#0f172a' }}>{quote.color}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Quantity:</span> <strong style={{ color: '#0f172a' }}>{quote.quantity} pcs</strong></div>
                            </>
                          )}

                          {/* Custom Design specs */}
                          {quote.type === 'designer' && (
                            <>
                              <div><span style={{ color: '#64748b' }}>Product Type:</span> <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{quote.extra_data?.productType === 'other' ? quote.extra_data?.customProductType : quote.extra_data?.productType}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Custom Text:</span> <strong style={{ color: '#0f172a' }}>"{quote.extra_data?.nameText}"</strong></div>
                              <div><span style={{ color: '#64748b' }}>Requested Size:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data?.designerSize || 'Medium'}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Preferred Color:</span> <strong style={{ color: '#0f172a' }}>{quote.color}</strong></div>
                            </>
                          )}

                          {/* Spare Parts specs */}
                          {quote.type === 'spareparts' && (
                            <>
                              <div><span style={{ color: '#64748b' }}>Component Name:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data?.partName}</strong></div>
                              {quote.extra_data?.dimensions && (
                                <div><span style={{ color: '#64748b' }}>Approx. Dimensions:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data.dimensions.length}×{quote.extra_data.dimensions.width}×{quote.extra_data.dimensions.height} mm</strong></div>
                              )}
                            </>
                          )}

                          {/* Prototype Lab specs */}
                          {quote.type === 'prototype' && (
                            <>
                              <div><span style={{ color: '#64748b' }}>Project Name:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data?.projectName}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Project Category:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data?.projectType}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Required Date:</span> <strong style={{ color: '#0f172a' }}>{quote.extra_data?.requiredDate}</strong></div>
                              <div><span style={{ color: '#64748b' }}>Quantity:</span> <strong style={{ color: '#0f172a' }}>{quote.quantity} pcs</strong></div>
                            </>
                          )}

                          {/* Catalog Order specs */}
                          {quote.type === 'order' && (
                            <>
                              <div><span style={{ color: '#64748b' }}>Payment Status:</span> <strong style={{ color: '#16a34a' }}>Paid (Confirmed)</strong></div>
                              <div><span style={{ color: '#64748b' }}>Receipt Ref:</span> <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{quote.extra_data?.receiptId}</strong></div>
                              <div style={{ marginTop: '0.6rem', fontWeight: '800', fontSize: '0.78rem', color: '#1e293b' }}>Items Purchased:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                                {quote.extra_data?.items?.map((item, idx) => (
                                  <div key={idx} style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                                    <span style={{ color: '#334155', fontWeight: '600' }}>📦 {item.name} <span style={{ color: '#64748b', fontWeight: '400' }}>x{item.quantity}</span></span>
                                    <span style={{ fontWeight: '800', color: '#0f172a' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {quote.notes && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '4px', borderLeft: '2px solid #94a3b8', fontStyle: 'italic', color: '#475569', fontSize: '0.78rem' }}>
                              Notes: "{quote.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: File Assets & Quotation Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* File Details */}
                        <div>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
                            Attached Reference Files
                          </h4>
                          {quote.extra_data?.files && quote.extra_data.files.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {quote.extra_data.files.map((fileObj, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px', color: '#334155' }}>📎 {fileObj.fileName}</span>
                                  <a href={fileObj.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '700' }}>
                                    <Download size={11} /> Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : quote.file_url ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px', color: '#334155' }}>📎 {quote.file_name}</span>
                              <a href={quote.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '700' }}>
                                <Download size={11} /> Download
                              </a>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No files attached.</span>
                          )}
                        </div>

                        {/* Price Details Block */}
                        <div style={{
                          border: `1px solid ${quote.price_estimate ? '#bbf7d0' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          padding: '1rem',
                          background: quote.price_estimate ? '#f0fdf4' : '#fafafa',
                          marginTop: 'auto'
                        }}>
                          {quote.price_estimate ? (
                            <div>
                              <div style={{ fontSize: '0.67rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em' }}>Final Quotation Price</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                                ₹{quote.price_estimate.toLocaleString('en-IN')}
                              </div>
                              {quote.admin_notes && (
                                <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.5rem', borderTop: '1px dashed #bbf7d0', paddingTop: '0.5rem', lineHeight: '1.4' }}>
                                  <strong>Feedback Notes:</strong> "{quote.admin_notes}"
                                </div>
                              )}
                              {quote.status === 'Quoted' ? (
                                <button
                                  onClick={() => handleOpenShippingModal(quote)}
                                  className="btn-primary"
                                  style={{
                                    width: '100%',
                                    marginTop: '0.8rem',
                                    height: '38px',
                                    fontSize: '0.78rem',
                                    fontWeight: '800',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#000'}
                                >
                                  Pay Now (₹{quote.price_estimate.toLocaleString('en-IN')})
                                </button>
                              ) : (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.6rem', fontStyle: 'italic' }}>
                                  *Our support team will contact you on your phone/email to finalize production & shipping.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.5' }}>
                              <div style={{ fontWeight: '700', color: '#334155', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⏳ Quote Under Review
                              </div>
                              Your specifications are being analyzed by our cost engineers. Your customized price quotation will be updated here within 2 hours.
                            </div>
                          )}
                        </div>

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
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            width: '90%',
            maxWidth: '520px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            animation: 'slideUpOverlay 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0, color: '#111' }}>
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>ZIP *</label>
                  <input
                    type="text"
                    placeholder="6-digit ZIP"
                    value={shippingDetails.zip}
                    onChange={e => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                    className="input-field"
                    style={{ height: '38px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
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
                  {processingPayment ? 'Processing...' : `Pay ₹${activeQuoteToPay?.price_estimate?.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
