import React from 'react';
import { Camera, Ruler, Upload, CheckCircle2, FileText } from 'lucide-react';

export default function SpareParts({ onAddToCart, user, setActiveTab }) {
  const [photo, setPhoto] = React.useState(null);
  const [photoFile, setPhotoFile] = React.useState(null);
  const [partName, setPartName] = React.useState('');
  
  // Dimensions
  const [dims, setDims] = React.useState({ length: '', width: '', height: '' });
  const [notes, setNotes] = React.useState('');

  // Contact Details
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');

  // Submission Status
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [ticketId, setTicketId] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  };

  const handleSampleUpload = () => {
    setPhoto("https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=400"); // mock image of broken gear
    setPhotoFile({ name: "broken_gear_sample.png" });
    setPartName("Bike Indicator Holder");
    setDims({ length: '100', width: '50', height: '20' });
    setNotes("This part is broken. Need same design.");
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!photo) {
      alert("Please upload a photo of the broken part first.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (photoFile && !(photoFile instanceof File)) {
        // Fetch mock image to convert it into a real File Blob
        const response = await fetch(photo);
        const blob = await response.blob();
        formData.append('photo', blob, 'broken_gear_sample.png');
      } else {
        formData.append('photo', photoFile);
      }
      formData.append('partName', partName);
      formData.append('length', dims.length);
      formData.append('width', dims.width);
      formData.append('height', dims.height);
      formData.append('notes', notes);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);

      const response = await fetch('http://localhost:5000/api/quotes/spareparts', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit spare parts request to backend.');
      }

      const data = await response.json();
      setTicketId(data.ticketId);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>SPARE PARTS HUB</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Spare Parts Re-Creation Portal</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.9rem' }}>
          Have a broken or unavailable machine part? Upload a photograph, describe its usage, and submit a manual redesign and print request.
        </p>
      </div>

      <div className="spare-parts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Diagnostics Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px' }}>
            <span className="badge-outline" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>RE-CREATION WORKFLOW</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#000', marginBottom: '1rem' }}>How Spare Parts Re-Creation Works</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              We specialize in duplicating broken plastic or metal gears, housings, casings, and brackets that are no longer commercially available.
            </p>

            {/* Guide Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Upload Photo of Broken Part</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Take a clear, well-lit photograph of the broken piece showing all cracks, dimensions, or mounting holes.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Describe Specifications</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Provide optional measurements (length, width, height) and detail the part's operating stress or temperature context.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Get Manual Modeling Quote</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Our design engineers manually analyze the specifications, draft a fresh CAD model blueprint, and send you a custom production quote.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Feasibility Report / Form */}
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', minHeight: '350px' }}>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                boxShadow: '0 4px 10px rgba(22,163,74,0.06)'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000', marginBottom: '0.25rem' }}>Spare Part Request Sent!</h2>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#475569', fontWeight: 'bold' }}>
                  TICKET ID: {ticketId}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Thank you! Our modelers will manually analyze the uploaded part details and contact you via email with a design draft blueprint and manufacturing quote within 2 hours.
              </p>
              
              <div style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                textAlign: 'left',
                fontSize: '0.76rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Part Name:</span> <strong style={{ color: '#000' }}>{partName}</strong></div>
                {photoFile && <div><span style={{ color: 'var(--text-secondary)' }}>Photo Attached:</span> <strong style={{ color: '#000' }}>{photoFile.name}</strong></div>}
                {(dims.length || dims.width || dims.height) && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Size Dimensions:</span>{' '}
                    <strong style={{ color: '#000' }}>
                      {dims.length || '?'} x {dims.width || '?'} x {dims.height || '?'} mm
                    </strong>
                  </div>
                )}
                {notes && <div><span style={{ color: 'var(--text-secondary)' }}>Additional Notes:</span> <strong style={{ color: '#000' }}>"{notes}"</strong></div>}
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact Info:</span> <strong style={{ color: '#000' }}>{customerName} ({customerEmail}) | {customerPhone}</strong></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setPhoto(null);
                  setPhotoFile(null);
                  setPartName('');
                  setDims({ length: '', width: '', height: '' });
                  setNotes('');
                }}
                className="btn-secondary"
                style={{ width: '100%', height: '40px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.25rem', color: '#000', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem', fontWeight: '800' }}>
                Request Spare Part Quote
              </h2>

              <form onSubmit={handleSubmitQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Photo Uploader */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Upload Broken Part Photo</label>
                  {photo ? (
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1.77', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={photo} alt="Broken Part Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => { setPhoto(null); setPhotoFile(null); }} 
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#000',
                          border: 'none',
                          color: '#fff',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div className="upload-zone" style={{ padding: '2.5rem 1rem', borderRadius: '6px' }}>
                      <Camera size={28} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload photo showing breakages</p>
                      <input type="file" id="photo-input" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                      <label htmlFor="photo-input" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        Choose Photo
                      </label>
                    </div>
                  )}
                  {!photo && (
                    <button 
                      type="button" 
                      onClick={handleSampleUpload} 
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: '0.25rem'
                      }}
                    >
                      Or load a sample broken gear photo
                    </button>
                  )}
                </div>

                {/* Part Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Part Name</label>
                  <input
                    type="text"
                    required
                    placeholder='e.g. "Bike Indicator Holder"'
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px' }}
                  />
                </div>

                {/* Dimension Form (Optional) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Ruler size={14} /> Bounding Dimensions (Optional - mm)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="number"
                      placeholder="Length"
                      value={dims.length}
                      onChange={(e) => setDims({ ...dims, length: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Width"
                      value={dims.width}
                      onChange={(e) => setDims({ ...dims, width: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px' }}
                    />
                    <input
                      type="number"
                      placeholder="Height"
                      value={dims.height}
                      onChange={(e) => setDims({ ...dims, height: e.target.value })}
                      className="input-field"
                      style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Additional Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='e.g., "This part is broken. Need same design. Need before 15 Aug."'
                    className="input-field"
                    style={{ resize: 'none', borderRadius: '6px', fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                {/* Contact Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Details</label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Full Name</span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name"
                        className="input-field"
                        style={{ borderRadius: '6px', height: '34px', fontSize: '0.78rem' }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Email Address</span>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="input-field"
                        style={{ borderRadius: '6px', height: '34px', fontSize: '0.78rem' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Phone Number</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="input-field"
                      style={{ borderRadius: '6px', height: '34px', fontSize: '0.78rem' }}
                      required
                    />
                  </div>
                </div>

                {user ? (
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', height: '42px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={submitting || !photo || !customerName || !customerEmail || !customerPhone}
                  >
                    {submitting ? 'Sending Request...' : 'Request Spare Part Quote'}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                    >
                      🔒 Sign In to Submit Quote Request
                    </button>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                      *Sign in is required to submit custom print quotes & track orders.
                    </span>
                  </div>
                )}
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
