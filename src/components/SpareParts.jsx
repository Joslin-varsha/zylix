import React from 'react';
import { Camera, Ruler, ShieldAlert, AlertTriangle, ShoppingCart } from 'lucide-react';

export default function SpareParts({ onAddToCart }) {
  const [photo, setPhoto] = React.useState(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [diagnosticRun, setDiagnosticRun] = React.useState(false);
  
  // Dimensions
  const [dims, setDims] = React.useState({ length: '', width: '', height: '' });
  // Stress profile
  const [stress, setStress] = React.useState('light');
  const [temperature, setTemperature] = React.useState('normal');
  const [customMaterial, setCustomMaterial] = React.useState('PLA');

  // Simulated diagnostic assessment
  const [assessment, setAssessment] = React.useState({
    feasible: true,
    warnings: [],
    recommendedMaterial: 'PLA',
    quote: 0,
    checklist: []
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setDiagnosticRun(false);
    }
  };

  const handleSampleUpload = () => {
    setPhoto("https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=400"); // mock image of broken gear
    setDims({ length: '65', width: '65', height: '18' });
    setStress('heavy');
    setTemperature('high');
    setCustomMaterial('PETG');
    setDiagnosticRun(false);
  };

  const handleRunDiagnostic = (e) => {
    e.preventDefault();
    if (!photo) {
      alert("Please upload a photo of the broken part first.");
      return;
    }
    if (!dims.length || !dims.width || !dims.height) {
      alert("Please provide the bounding dimensions.");
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setDiagnosticRun(true);

      const l = parseFloat(dims.length);
      const w = parseFloat(dims.width);
      const h = parseFloat(dims.height);
      const volumeEst = (l * w * h) / 1000; // cm³ roughly

      let warnings = [];
      let checklist = [];
      let feasible = true;
      let recommendedMat = 'PLA';

      // Rules engine simulation
      if (l > 250 || w > 250 || h > 250) {
        warnings.push("Dimensions exceed standard build volumes (250mm³). Part must be printed in interlocking segments.");
        checklist.push({ title: "Build Volume Clearance", pass: false, desc: "Segmented print required" });
        feasible = true;
      } else {
        checklist.push({ title: "Build Volume Clearance", pass: true, desc: "Fits on a single build plate" });
      }

      if (stress === 'heavy') {
        recommendedMat = 'PETG';
        if (customMaterial === 'PLA') {
          warnings.push("High load-bearing part: Standard PLA is brittle. ABS or carbon-fiber PETG strongly recommended.");
          checklist.push({ title: "Mechanical Integrity", pass: false, desc: "Material grade too low for load stress" });
        } else {
          checklist.push({ title: "Mechanical Integrity", pass: true, desc: "Structural material matched" });
        }
      } else {
        checklist.push({ title: "Mechanical Integrity", pass: true, desc: "Standard load profile" });
      }

      if (temperature === 'high') {
        recommendedMat = 'ABS';
        if (customMaterial === 'PLA' || customMaterial === 'PETG') {
          warnings.push("High temp deflection index required. ABS or carbon-fiber Nylon needed.");
          checklist.push({ title: "Thermal Tolerance", pass: false, desc: "Risk of structural softening at heat" });
        } else {
          checklist.push({ title: "Thermal Tolerance", pass: true, desc: "Heat deflection limits cleared" });
        }
      } else {
        checklist.push({ title: "Thermal Tolerance", pass: true, desc: "Standard temperature limits" });
      }

      const failingCheckpoints = checklist.filter(c => !c.pass).length;
      if (failingCheckpoints >= 2) {
        feasible = false;
      }

      const baseCost = Math.round((volumeEst * 1.2 * (recommendedMat === 'ABS' ? 10 : recommendedMat === 'PETG' ? 8 : 6)) + 350);

      setAssessment({
        feasible,
        warnings,
        recommendedMaterial: recommendedMat,
        quote: baseCost,
        checklist
      });
    }, 2000);
  };

  const handleAddPartsToCart = () => {
    if (!photo || !diagnosticRun) return;
    const item = {
      id: 'part-' + Date.now(),
      name: `Recreated Spare Part (${dims.length}x${dims.width}mm)`,
      isCustom: true,
      price: assessment.quote,
      quantity: 1,
      material: assessment.recommendedMaterial,
      infill: stress === 'heavy' ? 60 : 30,
      resolution: '0.12mm',
      color: 'Matte Black',
      image: null
    };
    onAddToCart(item);
    alert('Spare Part quote added to Cart!');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>BUSINESS OPPORTUNITY</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Spare Parts Re-Creation Portal</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Have a broken or unavailable machine part? Upload a photograph, input critical bounding dimensions, and run our dynamic printability scanner.
        </p>
      </div>

      <div className="spare-parts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Diagnostics Input Form */}
        <form onSubmit={handleRunDiagnostic} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#000', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Diagnostic Specifications</h2>
          
          {/* Photo Uploader */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>1. Upload Broken Part Photo</label>
            {photo ? (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1.77', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <img src={photo} alt="Broken Part Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setPhoto(null)} 
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: '#000',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    padding: '2px 5px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  Clear Photo
                </button>
              </div>
            ) : (
              <div className="upload-zone" style={{ padding: '2.5rem 1rem' }}>
                <Camera size={28} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload photo showing breakages</p>
                <input type="file" id="photo-input" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <label htmlFor="photo-input" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  Choose Photo
                </label>
              </div>
            )}
            <button 
              type="button" 
              onClick={handleSampleUpload} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '0.25rem'
              }}
            >
              Or load a sample broken gear photo
            </button>
          </div>

          {/* Dimension Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ruler size={14} /> 2. Bounding Dimensions (mm)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <input
                type="number"
                required
                placeholder="Length"
                value={dims.length}
                onChange={(e) => setDims({ ...dims, length: e.target.value })}
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--border-color)' }}
              />
              <input
                type="number"
                required
                placeholder="Width"
                value={dims.width}
                onChange={(e) => setDims({ ...dims, width: e.target.value })}
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--border-color)' }}
              />
              <input
                type="number"
                required
                placeholder="Height"
                value={dims.height}
                onChange={(e) => setDims({ ...dims, height: e.target.value })}
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          {/* Stress profile Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>3. Structural Load Requirements</label>
            <select value={stress} onChange={(e) => setStress(e.target.value)} className="select-field">
              <option value="light">Static Case / Light stress (covers, casing, bracket)</option>
              <option value="heavy">Dynamic mechanical force (gear, spindle, linkage)</option>
            </select>
          </div>

          {/* Temperature Profile Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>4. Environmental Temperature</label>
            <select value={temperature} onChange={(e) => setTemperature(e.target.value)} className="select-field">
              <option value="normal">Ambient Room Temp (&lt; 50°C / 120°F)</option>
              <option value="high">Engine bay / Heat chambers (&gt; 80°C / 175°F)</option>
            </select>
          </div>

          {/* Proposed Material choice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>5. Selected Material Choice</label>
            <select value={customMaterial} onChange={(e) => setCustomMaterial(e.target.value)} className="select-field">
              <option value="PLA">PLA (Basic Filament)</option>
              <option value="PETG">PETG (Industrial Grade)</option>
              <option value="ABS">ABS (Heat & Wear Resistant)</option>
            </select>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', height: '42px', marginTop: '0.5rem' }}
            disabled={isScanning}
          >
            {isScanning ? "Running Diagnostic Analysis..." : "Verify Printability & Get Quote"}
          </button>
        </form>

        {/* Right Column: AI Diagnostic Verdict Report */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '350px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#000', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Diagnostic Feasibility Report
          </h2>

          {isScanning && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '28px', height: '28px' }} />
              <h4 className="animate-pulse-slow" style={{ color: '#000' }}>CHECKING PART TOLERANCE MATRIX</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Analyzing wall thickness constraints and stress loads...
              </p>
            </div>
          )}

          {!isScanning && !diagnosticRun && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <ShieldAlert size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Diagnostics pending.</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Please fill in the dimensional parameters and select a photo to generate a print viability rating.
              </p>
            </div>
          )}

          {!isScanning && diagnosticRun && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Verdict header banner (Strictly Monochromatic) */}
              <div style={{
                border: '1px solid #000000',
                backgroundColor: assessment.feasible ? '#000000' : 'transparent',
                color: assessment.feasible ? '#ffffff' : '#000000',
                padding: '1.25rem',
                textAlign: 'center',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.05)'
              }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>AI Feasibility Verdict</span>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  marginTop: '0.25rem'
                }}>
                  {assessment.feasible ? "DO: PRINTABLE" : "DO NOT: REJECTED"}
                </div>
              </div>

              {/* Checklist checklist grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Checklist Details</h4>
                {assessment.checklist.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#000' }}>{item.title}</span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                    </div>
                    <span style={{
                      fontWeight: 'bold',
                      color: '#000000',
                      fontSize: '0.75rem'
                    }}>
                      {item.pass ? "✓ CLEAR" : "✗ REPLAN"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Warning notifications (Monochromatic box) */}
              {assessment.warnings.length > 0 && (
                <div style={{
                  border: '1px solid #000000',
                  backgroundColor: '#fafafa',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000000', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <AlertTriangle size={14} />
                    <span>Important Recommendations</span>
                  </div>
                  {assessment.warnings.map((warn, i) => (
                    <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      · {warn}
                    </p>
                  ))}
                </div>
              )}

              {/* Summary quote segment */}
              {assessment.feasible && (
                <div style={{
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Recommended Filament</span>
                    <span style={{ fontWeight: 'bold', color: '#000' }}>{assessment.recommendedMaterial}</span>
                  </div>
                  <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Fitted print wall tolerance</span>
                    <span style={{ color: '#000' }}>±0.15 mm</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '0.5rem',
                    marginTop: '0.25rem',
                    fontFamily: 'var(--font-display)',
                    color: '#000'
                  }}>
                    <span>Est. Quote</span>
                    <span>₹{assessment.quote.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    onClick={handleAddPartsToCart}
                    className="btn-primary"
                    style={{ width: '100%', height: '42px', marginTop: '0.5rem' }}
                  >
                    Add Spare Part Config to Cart
                  </button>
                </div>
              )}

              {!assessment.feasible && (
                <div style={{
                  border: '1px solid var(--border-color)',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: '#fafafa'
                }}>
                  <p>Our checker suggests this layout will fail standard print stresses.</p>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    Please adjust mechanical load selections or change the printing material choice above to re-evaluate structural viability.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
