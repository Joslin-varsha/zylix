import React from 'react';
import { Upload, CheckCircle2, Calendar } from 'lucide-react';

export default function StudentHub({ user, setActiveTab }) {
  const [projectType, setProjectType] = React.useState('College Project');
  const [customProjectType, setCustomProjectType] = React.useState('');
  const [projectName, setProjectName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [customQuantity, setCustomQuantity] = React.useState('');
  const [requiredDate, setRequiredDate] = React.useState('');
  const [uploadedFiles, setUploadedFiles] = React.useState([]);

  // Contact Details
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');

  // Submission states
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPrototypeQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('projectType', projectType);
      formData.append('customProjectType', customProjectType);
      formData.append('projectName', projectName);
      formData.append('description', description);
      formData.append('quantity', quantity);
      formData.append('customQuantity', customQuantity);
      formData.append('requiredDate', requiredDate);
      formData.append('customerName', customerName);
      formData.append('customerEmail', customerEmail);
      formData.append('customerPhone', customerPhone);

      // Append multiple files
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/quotes/prototype', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit prototype request to backend.');
      }

      const resData = await response.json();
      setTicketId(resData.ticketId);
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
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>PROTOTYPE LAB</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Turn Your Idea Into a Physical Prototype</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0', fontSize: '0.9rem' }}>
          For Students, Startups, Researchers & Innovators
        </p>
      </div>

      {/* Main Form container */}
      <div className="student-hub-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
        marginBottom: '4rem'
      }}>
        
        {/* Left Column: Instructions Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px' }}>
            <span className="badge-outline" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Prototype Pipeline</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#000', marginBottom: '1rem' }}>How Prototyping Works</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              We specialize in duplicating custom mechanical sketches, college blueprints, drone linkages, and casings for scientific models.
            </p>

            {/* Guide Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Upload Reference Sketch or File</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Attach your hand-drawn sketch, layout PDF, sensor schematics, or mock STL mesh file.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Cost Engineering Review</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Our design engineers manually review your layout requirements and calculate optimal print parameters.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', margin: '0 0 0.15rem 0' }}>Quote Approval & Print</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
                    Receive a customized quotation ticket via email. We prepare the custom CAD layout and dispatch the physical print within 48 hours.
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#000', marginBottom: '0.25rem' }}>Request Submitted!</h2>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#475569', fontWeight: 'bold' }}>
                  TICKET ID: {ticketId}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto' }}>
                Thank you! Our modelers will manually analyze the uploaded prototype details and contact you via email with a design blueprint draft and manufacturing quote.
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
                <div><span style={{ color: 'var(--text-secondary)' }}>Project Type:</span> <strong style={{ color: '#000' }}>{projectType === 'Other' ? (customProjectType || 'Custom Project') : projectType}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Project Name:</span> <strong style={{ color: '#000' }}>{projectName}</strong></div>
                {uploadedFiles.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Attached Files:</span>{' '}
                    <strong style={{ color: '#000' }}>
                      {uploadedFiles.map(f => f.name).join(', ')}
                    </strong>
                  </div>
                )}
                <div><span style={{ color: 'var(--text-secondary)' }}>Quantity:</span> <strong style={{ color: '#000' }}>{quantity === 'Other' ? customQuantity : quantity} pcs</strong></div>
                {requiredDate && <div><span style={{ color: 'var(--text-secondary)' }}>Required Date:</span> <strong style={{ color: '#000' }}>{requiredDate}</strong></div>}
                {description && <div><span style={{ color: 'var(--text-secondary)' }}>Description:</span> <strong style={{ color: '#000' }}>"{description}"</strong></div>}
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact Info:</span> <strong style={{ color: '#000' }}>{customerName} ({customerEmail}) | {customerPhone}</strong></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setProjectType('College Project');
                  setCustomProjectType('');
                  setProjectName('');
                  setUploadedFiles([]);
                  setDescription('');
                  setQuantity(1);
                  setCustomQuantity('');
                  setRequiredDate('');
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
                Request Prototype Quote
              </h2>

              <form onSubmit={handleSubmitPrototypeQuote} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                
                {/* Project Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>What are you building?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
                    {['School Project', 'College Project', 'Startup Prototype', 'Research Model', 'Architecture Model', 'Robotics Project', 'Science Model', 'Other'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProjectType(type)}
                        style={{
                          padding: '0.5rem 0.25rem', 
                          fontSize: '0.72rem',
                          background: projectType === type ? '#000' : 'transparent',
                          color: projectType === type ? '#fff' : '#000',
                          border: '1px solid ' + (projectType === type ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          fontWeight: '600',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {projectType === 'Other' && (
                    <input
                      type="text"
                      className="input-field animate-fadeIn"
                      value={customProjectType}
                      onChange={(e) => setCustomProjectType(e.target.value)}
                      placeholder='e.g. "Industrial Jig", "Art Installation"'
                      style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px', marginTop: '0.5rem' }}
                      required={projectType === 'Other'}
                    />
                  )}
                </div>

                {/* Project Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder='e.g. "Smart Dustbin"'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px' }}
                  />
                </div>

                {/* File Uploads */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Upload Reference Files (Sketches, PDF, STL)</label>
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '1rem',
                    textAlign: 'center',
                    background: '#fafafa',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    <input 
                      type="file" 
                      id="prototype-files-input" 
                      multiple
                      onChange={handleFileUpload} 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Upload size={20} />
                      <span>Click to upload sketches, drawings, PDF or STL files</span>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                      {uploadedFiles.map((f, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px' }}>{f.name}</span>
                          <button type="button" onClick={() => handleRemoveFile(fIdx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='e.g., "Need an enclosure for ESP32. Need LCD cutout. Need ultrasonic sensor holes."'
                    className="input-field"
                    style={{ resize: 'none', borderRadius: '6px', fontSize: '0.78rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Quantity</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                    {[1, 2, 5, 10, 'Other'].map(qty => (
                      <button
                        key={qty} 
                        type="button" 
                        onClick={() => setQuantity(qty)}
                        style={{
                          padding: '0.5rem 0', fontSize: '0.75rem',
                          background: quantity === qty ? '#000' : 'transparent',
                          color: quantity === qty ? '#fff' : '#000',
                          border: '1px solid ' + (quantity === qty ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', borderRadius: '6px',
                          fontWeight: 'bold'
                        }}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>

                  {quantity === 'Other' && (
                    <input
                      type="number"
                      min="1"
                      className="input-field animate-fadeIn"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(parseInt(e.target.value) || '')}
                      placeholder="Enter custom quantity"
                      style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px', marginTop: '0.5rem' }}
                      required={quantity === 'Other'}
                    />
                  )}
                </div>

                {/* Required Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Required Date
                  </label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="input-field"
                    style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px' }}
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
                    disabled={submitting || !customerName || !customerEmail || !customerPhone}
                  >
                    {submitting ? 'Sending Request...' : 'Request Prototype Quote'}
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
