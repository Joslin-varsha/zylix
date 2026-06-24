import React from 'react';
import { Upload, HardDrive, Layers, Box, Award, Key, Gift, CheckCircle2, FileText } from 'lucide-react';

export default function AIPrintLab({ 
  onAddToCart,
  labTab = 'slicer',
  setLabTab,
  designerPreset = 'keychain',
  setDesignerPreset,
  customizerText = '',
  setCustomizerText,
  user,
  setActiveTab
}) {
  // Sync wrapper states for internal tab rendering
  const [activeLabTab, setActiveLabTab] = React.useState(labTab);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');

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

  React.useEffect(() => {
    setActiveLabTab(labTab);
  }, [labTab]);

  // 1. --- CAD SLICER (UPLOAD FILE TO PRINT) STATES & HANDLERS ---
  const [file, setFile] = React.useState(null);
  const [material, setMaterial] = React.useState('PLA');
  const [infill, setInfill] = React.useState(20);
  const [layerHeight, setLayerHeight] = React.useState('0.20');
  const [color, setColor] = React.useState('Matte Black');
  const [quantity, setQuantity] = React.useState(1);
  const [notes, setNotes] = React.useState('');
  const [quoteSubmitted, setQuoteSubmitted] = React.useState(false);
  const [submittingQuote, setSubmittingQuote] = React.useState(false);
  const [slicerTicketId, setSlicerTicketId] = React.useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmittingQuote(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('material', material);
      formData.append('color', color);
      formData.append('quantity', quantity);
      formData.append('notes', notes);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);

      const response = await fetch('http://localhost:5000/api/quotes/slicer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request to backend.');
      }

      const resData = await response.json();
      setSlicerTicketId(resData.ticketId);
      setQuoteSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmittingQuote(false);
    }
  };


  // 2. --- PRODUCT DESIGNER (DESIGN YOUR OWN) STATES & HANDLERS ---
  const [productType, setProductType] = React.useState('keychain'); // 'keychain', 'nameboard', 'trophy', 'phonestand', 'other'
  const [customProductType, setCustomProductType] = React.useState('');
  const [nameText, setNameText] = React.useState(customizerText || 'JOSLIN VARSHA');
  const [designerColor, setDesignerColor] = React.useState('Gold'); // 'Black', 'White', 'Gold', 'Red', 'Blue', 'Other'
  const [customColor, setCustomColor] = React.useState('');
  const [designerSize, setDesignerSize] = React.useState('Medium'); // 'Small', 'Medium', 'Large', 'Custom'
  const [customSize, setCustomSize] = React.useState('');
  const [referenceFile, setReferenceFile] = React.useState(null);
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [designerSubmitting, setDesignerSubmitting] = React.useState(false);
  const [designerSubmitted, setDesignerSubmitted] = React.useState(false);
  const [designerTicketId, setDesignerTicketId] = React.useState('');

  React.useEffect(() => {
    if (customizerText) {
      setNameText(customizerText);
    }
  }, [customizerText]);

  // Sync state with incoming preset from catalog customization redirect
  React.useEffect(() => {
    if (designerPreset) {
      setProductType(designerPreset);
    }
  }, [designerPreset]);

  const handleReferenceFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setReferenceFile(selectedFile);
    }
  };

  const handleSubmitDesignerQuote = async (e) => {
    e.preventDefault();
    setDesignerSubmitting(true);
    try {
      const formData = new FormData();
      if (referenceFile) {
        formData.append('referenceFile', referenceFile);
      }
      formData.append('productType', productType);
      formData.append('customProductType', customProductType);
      formData.append('nameText', nameText);
      formData.append('designerColor', designerColor);
      formData.append('customColor', customColor);
      formData.append('designerSize', designerSize);
      formData.append('customSize', customSize);
      formData.append('additionalNotes', additionalNotes);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);

      const response = await fetch('http://localhost:5000/api/quotes/designer', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit design request to backend.');
      }

      const resData = await response.json();
      setDesignerTicketId(resData.ticketId);
      setDesignerSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setDesignerSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        {activeLabTab === 'slicer' && (
          <>
            <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ZYLIX PRINT SERVICES</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Upload File to Print</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.9rem' }}>
              Upload your custom CAD models (STL, OBJ, or 3MF) to request a custom printing quote from our manufacturing engineers.
            </p>
          </>
        )}
        {activeLabTab === 'designer' && (
          <>
            <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ZYLIX 3D DESIGNER</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Design Your Own Product</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.9rem' }}>
              Submit your product specifications, sketches, custom text, and color choices to request a custom model draft and print quote.
            </p>
          </>
        )}
      </div>

      {/* Grid Content Panel */}
      <div className="print-lab-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        
        {/* LEFT PANEL: Guides and File Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TAB 1: CAD upload container */}
          {activeLabTab === 'slicer' && (
            <>
              {!file && (
                <div 
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('active'); }}
                  onDrop={handleDrop}
                  className="upload-zone"
                  style={{ padding: '4.5rem 2rem', borderRadius: '12px' }}
                >
                  <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.1rem', color: '#000', marginBottom: '0.5rem' }}>Upload CAD / Mesh file</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Drag and drop your files here, or click to choose from system files.
                  </p>
                  
                  <input 
                    type="file" 
                    id="file-input" 
                    accept=".stl,.obj,.3mf" 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="file-input" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Browse Files
                  </label>
                </div>
              )}
            </>
          )}

          {/* Tab 1: Slicer File Status Block */}
          {activeLabTab === 'slicer' && file && (
            <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#16a34a' }}>
                  ✓ SECURE FILE UPLOADED
                </span>
                <button 
                  onClick={() => { setFile(null); setQuoteSubmitted(false); }} 
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', height: '28px', borderRadius: '14px' }}
                >
                  Change File
                </button>
              </div>

              <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  boxShadow: '0 4px 10px rgba(22,163,74,0.06)'
                }}>
                  <Box size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#000', margin: 0 }}>{file.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    File successfully attached
                  </p>
                </div>
              </div>

              {/* Progress Stepper List */}
              <div style={{
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>1</div>
                  <div>
                    <span style={{ fontWeight: '700', color: '#000', display: 'block' }}>Upload CAD Mesh File</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Geometry uploaded and checked successfully.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: quoteSubmitted ? '#000' : 'var(--accent-color)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>2</div>
                  <div>
                    <span style={{ fontWeight: '700', color: '#000', display: 'block' }}>Configure Manufacturing Options</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Select material, color, quantity, and requirements notes.</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: quoteSubmitted ? 'var(--accent-color)' : '#e2e8f0', color: quoteSubmitted ? '#ffffff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>3</div>
                  <div>
                    <span style={{ fontWeight: '700', color: quoteSubmitted ? '#000' : 'var(--text-secondary)', display: 'block' }}>Engineering Quote Analysis</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>Admin reviews mesh printability and dispatches custom PDF quote.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Design Workflow Guide (Flat) */}
          {activeLabTab === 'designer' && (
            <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px' }}>
              <span className="badge-outline" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Design Workflow</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#000', marginBottom: '1rem' }}>How Design Requests Work</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Have a specific design idea in mind? Our expert team can turn your concepts, text, and sketches into high-quality physical 3D prints.
              </p>

              {/* Guide Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Submit Specifications</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                      Choose your product type, custom text, preferred color, and size. Add reference sketches or logos to help us visualize your needs.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Manual Engineering Review</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                      Our manufacturing engineers manually review your request. We draft the 3D model geometry blueprints based on your specifications.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Quote & Design Preview</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                      Within 2 hours, we will email you a digital design preview blueprint along with a customized pricing quote ticket to start production.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: Form configurations depending on selected Tab */}
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
          
          {/* ───────────────── SLICER CONFIG PANEL (REQUEST QUOTE FLOW) ───────────────── */}
          {activeLabTab === 'slicer' && quoteSubmitted && (
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000', marginBottom: '0.25rem' }}>Quote Submitted!</h2>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#475569', fontWeight: 'bold' }}>
                  TICKET: {slicerTicketId || `#ZYL-MOCK`}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Thank you! Our CAD engineers are reviewing your file structure, printability, and requirements. We will email your detailed PDF quote within 2 hours.
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
                gap: '0.4rem'
              }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>File Uploaded:</span> <strong style={{ color: '#000' }}>{file?.name}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Material Selected:</span> <strong style={{ color: '#000' }}>{material}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Color Selected:</span> <strong style={{ color: '#000' }}>{color}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Quantity:</span> <strong style={{ color: '#000' }}>{quantity} pcs</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact Info:</span> <strong style={{ color: '#000' }}>{customerName} ({customerEmail}) | {customerPhone}</strong></div>
                {notes && <div><span style={{ color: 'var(--text-secondary)' }}>Notes:</span> <strong style={{ color: '#000' }}>"{notes}"</strong></div>}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setQuoteSubmitted(false);
                  setQuantity(1);
                  setNotes('');
                }}
                className="btn-secondary"
                style={{ width: '100%', height: '40px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                Submit Another Quote
              </button>
            </div>
          )}

          {activeLabTab === 'slicer' && !quoteSubmitted && (
            <>
              <h2 style={{ fontSize: '1.3rem', color: '#000', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: '800' }}>
                Request Custom Print Quote
              </h2>

              <form onSubmit={handleSubmitQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Print Material */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#000' }}>1. Print Material</label>
                  <select value={material} onChange={(e) => setMaterial(e.target.value)} className="select-field" style={{ borderRadius: '6px', height: '36px', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    <option value="PLA">PLA</option>
                    <option value="ABS">ABS</option>
                    <option value="PETG">PETG</option>
                    <option value="Resin">Resin</option>
                    <option value="Carbon Fiber">Carbon Fiber</option>
                    <option value="Nylon">Nylon</option>
                  </select>
                </div>

                {/* Filament Color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#000' }}>2. Material Color</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} className="select-field" style={{ borderRadius: '6px', height: '36px', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    <option value="Matte Black">Matte Black</option>
                    <option value="Arctic White">Arctic White</option>
                    <option value="Industrial Silver">Industrial Silver</option>
                    <option value="Crimson Red">Crimson Red</option>
                    <option value="Royal Blue">Royal Blue</option>
                    <option value="Silk Gold">Silk Gold</option>
                  </select>
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#000' }}>3. Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="input-field"
                    style={{ borderRadius: '6px', height: '36px', fontSize: '0.78rem' }}
                    required
                  />
                </div>

                {/* Additional Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#000' }}>4. Additional Notes / Requirements</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder='e.g., "Need strong print, must resist heat up to 80C, high infill density, etc."'
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
                    disabled={!file || submittingQuote}
                  >
                    {submittingQuote ? (
                      <>Submitting Request...</>
                    ) : (
                      <>
                        <Upload size={14} /> Request Custom Quote
                      </>
                    )}
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

          {/* ───────────────── DESIGNER CONFIG PANEL (DESIGN YOUR OWN) ───────────────── */}
          {activeLabTab === 'designer' && designerSubmitted && (
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000', marginBottom: '0.25rem' }}>Design Request Received!</h2>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#475569', fontWeight: 'bold' }}>
                  TICKET ID: {designerTicketId}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Your customized design request specifications have been dispatched to our modeling engineers. We will email your manual CAD design preview and print quote within 2 hours.
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
                <div><span style={{ color: 'var(--text-secondary)' }}>Product Type:</span> <strong style={{ color: '#000', textTransform: 'capitalize' }}>{productType === 'other' ? (customProductType || 'Custom Shape') : (productType === 'nameboard' ? 'Name Board' : productType === 'phonestand' ? 'Phone Stand' : productType)}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Custom Text/Name:</span> <strong style={{ color: '#000' }}>{nameText || 'None'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Color Selected:</span> <strong style={{ color: '#000', textTransform: 'capitalize' }}>{designerColor === 'Other' ? (customColor || 'Custom Color') : designerColor}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Size Requested:</span> <strong style={{ color: '#000', textTransform: 'capitalize' }}>{designerSize === 'Custom' ? (customSize || 'Custom Size') : designerSize}</strong></div>
                {referenceFile && <div><span style={{ color: 'var(--text-secondary)' }}>Reference Sketch:</span> <strong style={{ color: '#000' }}>{referenceFile.name}</strong></div>}
                {additionalNotes && <div><span style={{ color: 'var(--text-secondary)' }}>Notes:</span> <strong style={{ color: '#000' }}>"{additionalNotes}"</strong></div>}
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact Info:</span> <strong style={{ color: '#000' }}>{customerName} ({customerEmail}) | {customerPhone}</strong></div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDesignerSubmitted(false);
                  setProductType('keychain');
                  setCustomProductType('');
                  setNameText('JOSLIN VARSHA');
                  setDesignerColor('Gold');
                  setCustomColor('');
                  setDesignerSize('Medium');
                  setCustomSize('');
                  setReferenceFile(null);
                  setAdditionalNotes('');
                }}
                className="btn-secondary"
                style={{ width: '100%', height: '40px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                Submit Another Request
              </button>
            </div>
          )}

          {activeLabTab === 'designer' && !designerSubmitted && (
            <>
              <h2 style={{ fontSize: '1.3rem', color: '#000', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontWeight: '800' }}>
                Design Your Own Product
              </h2>

              <form onSubmit={handleSubmitDesignerQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Product Type Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>What would you like to create?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { id: 'keychain', label: 'Keychain', icon: <Key size={14} /> },
                      { id: 'nameboard', label: 'Name Board', icon: <Gift size={14} /> },
                      { id: 'trophy', label: 'Trophy', icon: <Award size={14} /> },
                      { id: 'phonestand', label: 'Phone Stand', icon: <Box size={14} /> },
                      { id: 'other', label: 'Other', icon: <FileText size={14} /> }
                    ].map(p => (
                      <button
                        key={p.id} 
                        type="button" 
                        onClick={() => setProductType(p.id)}
                        style={{
                          padding: '0.65rem 0.5rem', 
                          fontSize: '0.75rem',
                          background: productType === p.id ? '#000' : 'transparent',
                          color: productType === p.id ? '#fff' : '#000',
                          border: '1px solid ' + (productType === p.id ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontWeight: '600',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.icon} <span>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {productType === 'other' && (
                    <input
                      type="text"
                      className="input-field animate-fadeIn"
                      value={customProductType}
                      onChange={(e) => setCustomProductType(e.target.value)}
                      placeholder='e.g. "Mechanical Bracket", "Custom Phone Case"'
                      style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px', marginTop: '0.5rem' }}
                      required={productType === 'other'}
                    />
                  )}
                </div>

                {/* Custom text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Enter Name / Text</label>
                  <input
                    type="text"
                    className="input-field"
                    value={nameText}
                    onChange={(e) => setNameText(e.target.value)}
                    placeholder='e.g. "JOSLIN VARSHA"'
                    style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px' }}
                    required
                  />
                </div>

                {/* Upload Reference Sketch / Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Upload Reference Image / Logo (Optional)</label>
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    background: '#fafafa',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="file" 
                      id="designer-file-input" 
                      accept="image/*,.pdf" 
                      onChange={handleReferenceFileChange} 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <Upload size={14} />
                      <span>{referenceFile ? `Attached: ${referenceFile.name}` : 'Choose logo, sketch or sample image...'}</span>
                    </div>
                  </div>
                </div>

                {/* Color Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Color</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '0.4rem' }}>
                    {['Black', 'White', 'Gold', 'Red', 'Blue', 'Other'].map(col => (
                      <button
                        key={col} 
                        type="button" 
                        onClick={() => setDesignerColor(col)}
                        style={{
                          padding: '0.5rem', 
                          fontSize: '0.75rem',
                          background: designerColor === col ? '#000' : 'transparent',
                          color: designerColor === col ? '#fff' : '#000',
                          border: '1px solid ' + (designerColor === col ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          fontWeight: '600',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {col}
                      </button>
                    ))}
                  </div>

                  {designerColor === 'Other' && (
                    <input
                      type="text"
                      className="input-field animate-fadeIn"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder='e.g. "Silky Bronze", "Clear Transparent"'
                      style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px', marginTop: '0.5rem' }}
                      required={designerColor === 'Other'}
                    />
                  )}
                </div>

                {/* Size Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Size</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                    {['Small', 'Medium', 'Large', 'Custom'].map(sz => (
                      <button
                        key={sz} 
                        type="button" 
                        onClick={() => setDesignerSize(sz)}
                        style={{
                          padding: '0.5rem', 
                          fontSize: '0.75rem',
                          background: designerSize === sz ? '#000' : 'transparent',
                          color: designerSize === sz ? '#fff' : '#000',
                          border: '1px solid ' + (designerSize === sz ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          fontWeight: '600',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {designerSize === 'Custom' && (
                    <input
                      type="text"
                      className="input-field animate-fadeIn"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder='e.g. "12cm x 5cm x 2cm"'
                      style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px', marginTop: '0.5rem' }}
                      required={designerSize === 'Custom'}
                    />
                  )}
                </div>

                {/* Additional Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Additional Notes</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder='e.g. "Need glossy finish, need before 15 Aug, heavy weight infill, etc."'
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
                    style={{ width: '100%', height: '44px', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={designerSubmitting || !customerName || !customerEmail || !customerPhone}
                  >
                    {designerSubmitting ? 'Sending Request...' : 'Request Design & Quote'}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        height: '44px',
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
