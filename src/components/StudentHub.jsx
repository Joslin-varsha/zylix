import React from 'react';
import { Cpu, Award, ShieldCheck } from 'lucide-react';

export default function StudentHub({ onAddToCart, setStudentApplied, studentApplied }) {
  const [activePreset, setActivePreset] = React.useState('pcb');
  const [studentId, setStudentId] = React.useState('');
  const [idVerified, setIdVerified] = React.useState(false);

  // PCB case configs
  const [pcbBoard, setPcbBoard] = React.useState('arduino');
  const [pcbL, setPcbL] = React.useState(75);
  const [pcbW, setPcbW] = React.useState(55);
  const [pcbH, setPcbH] = React.useState(25);
  const [hasVents, setHasVents] = React.useState(true);

  // Chassis configs
  const [chassisShape, setChassisShape] = React.useState('rectangle');
  const [chassisL, setChassisL] = React.useState(200);
  const [chassisW, setChassisW] = React.useState(140);
  const [motorMounts, setMotorMounts] = React.useState(4);

  // Drone configs
  const [droneSize, setDroneSize] = React.useState(220);
  const [armThickness, setArmThickness] = React.useState(4);

  const canvasRef = React.useRef(null);

  // Pre-load PCB presets
  React.useEffect(() => {
    if (pcbBoard === 'arduino') { setPcbL(75); setPcbW(55); setPcbH(25); }
    if (pcbBoard === 'raspberry') { setPcbL(90); setPcbW(60); setPcbH(30); }
    if (pcbBoard === 'esp32') { setPcbL(55); setPcbW(35); setPcbH(18); }
  }, [pcbBoard]);

  // Canvas schema rendering loop
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#e9e9e9';
    ctx.lineWidth = 1;
    
    // Draw drafting alignment grids
    ctx.beginPath();
    for (let x = 20; x < w; x += 20) {
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let y = 20; y < h; y += 20) {
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;

    if (activePreset === 'pcb') {
      const boxW = Math.min(180, pcbL * 1.5);
      const boxH = Math.min(140, pcbW * 1.5);
      const startX = w / 2 - boxW / 2;
      const startY = h / 2 - boxH / 2;

      ctx.strokeRect(startX, startY, boxW, boxH);
      
      // Draw inner PCB borders
      ctx.strokeStyle = '#888';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(startX + 8, startY + 8, boxW - 16, boxH - 16);
      ctx.setLineDash([]);

      // Draw port cutouts
      ctx.fillStyle = '#000';
      ctx.fillRect(startX - 4, startY + boxH / 2 - 12, 6, 24); // USB Port
      ctx.fillStyle = '#444';
      ctx.font = '9px monospace';
      ctx.fillText("USB CUTOUT", startX + 8, startY + boxH / 2 + 4);

      if (hasVents) {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(startX + boxW / 2 - 20 + i*10, startY + 20);
          ctx.lineTo(startX + boxW / 2 - 20 + i*10, startY + 40);
          ctx.stroke();
        }
        ctx.fillText("COOLING VENTS", startX + boxW / 2 - 38, startY + 54);
      }

      // Dimension lines
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY + boxH + 15);
      ctx.lineTo(startX + boxW, startY + boxH + 15);
      ctx.stroke();
      ctx.fillText(`${pcbL} mm`, startX + boxW/2 - 15, startY + boxH + 28);
      
      ctx.beginPath();
      ctx.moveTo(startX - 15, startY);
      ctx.lineTo(startX - 15, startY + boxH);
      ctx.stroke();
      ctx.save();
      ctx.translate(startX - 22, startY + boxH/2 + 15);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${pcbW} mm`, 0, 0);
      ctx.restore();

    } else if (activePreset === 'chassis') {
      const startX = w / 2;
      const startY = h / 2;
      const chW = Math.min(180, chassisL * 0.7);
      const chH = Math.min(120, chassisW * 0.7);

      ctx.strokeStyle = '#000';
      if (chassisShape === 'rectangle') {
        ctx.strokeRect(startX - chW/2, startY - chH/2, chW, chH);
      } else {
        ctx.beginPath();
        ctx.arc(startX, startY, chH/2, 0, 2*Math.PI);
        ctx.stroke();
      }

      ctx.fillStyle = '#888';
      if (motorMounts >= 2) {
        ctx.fillRect(startX - chW/2 - 10, startY - chH/2 + 10, 8, 20);
        ctx.fillRect(startX - chW/2 - 10, startY + chH/2 - 30, 8, 20);
      }
      if (motorMounts === 4) {
        ctx.fillRect(startX + chW/2 + 2, startY - chH/2 + 10, 8, 20);
        ctx.fillRect(startX + chW/2 + 2, startY + chH/2 - 30, 8, 20);
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(startX - 20, startY - 20, 40, 6);
      ctx.fillRect(startX - 20, startY + 14, 40, 6);
      ctx.font = '9px monospace';
      ctx.fillText("CAD MATRIX", startX - 26, startY + 6);

      ctx.fillStyle = '#444';
      ctx.fillText(`${chassisL} x ${chassisW} mm`, 10, h - 10);

    } else if (activePreset === 'drone') {
      const startX = w / 2;
      const startY = h / 2;
      const span = Math.min(180, droneSize * 0.6);

      ctx.strokeStyle = '#666';
      ctx.lineWidth = armThickness * 2;
      ctx.beginPath();
      ctx.moveTo(startX - span/2, startY - span/2);
      ctx.lineTo(startX + span/2, startY + span/2);
      ctx.moveTo(startX + span/2, startY - span/2);
      ctx.lineTo(startX - span/2, startY + span/2);
      ctx.stroke();

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#fafafa';
      ctx.beginPath();
      ctx.arc(startX, startY, 25, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(startX - span/2, startY - span/2, 6, 0, 2*Math.PI);
      ctx.arc(startX + span/2, startY - span/2, 6, 0, 2*Math.PI);
      ctx.arc(startX + span/2, startY + span/2, 6, 0, 2*Math.PI);
      ctx.arc(startX - span/2, startY + span/2, 6, 0, 2*Math.PI);
      ctx.fill();

      ctx.fillStyle = '#444';
      ctx.font = '9px monospace';
      ctx.fillText(`Wheelbase Span: ${droneSize}mm`, startX - 58, startY + 45);
    }
  }, [activePreset, pcbBoard, pcbL, pcbW, pcbH, hasVents, chassisShape, chassisL, chassisW, motorMounts, droneSize, armThickness]);

  const handleVerifyStudent = (e) => {
    e.preventDefault();
    if (studentId.trim().length > 4) {
      setIdVerified(true);
      setStudentApplied(true);
    } else {
      alert("Invalid ID number. Please enter a valid registration ID.");
    }
  };

  const handleAddPresetToCart = () => {
    let name = '';
    let price = 0;
    let material = 'PLA';
    let sizeDesc = '';

    if (activePreset === 'pcb') {
      name = `ECE Casing (${pcbBoard.toUpperCase()})`;
      price = hasVents ? 549 : 450;
      material = 'ABS';
      sizeDesc = `${pcbL}x${pcbW}x${pcbH}mm`;
    } else if (activePreset === 'chassis') {
      name = `Robot Chassis Plate (${chassisShape})`;
      price = motorMounts === 4 ? 999 : 749;
      material = 'ABS';
      sizeDesc = `${chassisL}x${chassisW}mm`;
    } else if (activePreset === 'drone') {
      name = `Quadcopter X-Frame (${droneSize}mm)`;
      price = armThickness > 4 ? 1490 : 1150;
      material = 'Carbon-Fiber Nylon';
      sizeDesc = `Span: ${droneSize}mm, Thk: ${armThickness}mm`;
    }

    const item = {
      id: 'student-' + Date.now(),
      name: `${name} - ${sizeDesc}`,
      isCustom: true,
      price: price,
      quantity: 1,
      material: material,
      infill: 40,
      resolution: '0.20mm',
      color: 'Matte Black',
      image: null
    };

    onAddToCart(item);
    alert('Project Blueprint added to Cart!');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ECE & ME LAB</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>Student Mini-Project Printing Portal</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Custom casing layouts, robot components, and aerodynamic frames. Engineering students unlock structural discounts on structural builds.
        </p>
      </div>

      {/* Main container */}
      <div className="student-hub-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Blueprint configurator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Presets tab navigation */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#000', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Select Project Template
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'pcb', label: 'PCB Board Enclosure' },
                { id: 'chassis', label: 'Robot Chassis Base' },
                { id: 'drone', label: 'Drone Multicopter Frame' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    background: activePreset === preset.id ? '#000' : 'transparent',
                    color: activePreset === preset.id ? '#fff' : '#000',
                    border: '1px solid ' + (activePreset === preset.id ? '#000' : 'var(--border-color)'),
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Cpu size={16} /> {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form configs based on active Preset */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#000', marginBottom: '1.25rem' }}>Dimensional Parameters</h3>
            
            {/* PCB configurations */}
            {activePreset === 'pcb' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quick Presets</label>
                  <select value={pcbBoard} onChange={(e) => setPcbBoard(e.target.value)} className="select-field">
                    <option value="arduino">Arduino Uno R3/R4 Casing</option>
                    <option value="raspberry">Raspberry Pi 4 / 5 Casing</option>
                    <option value="esp32">ESP32 NodeMCU Dev Board Casing</option>
                    <option value="custom">Custom Sizing (Enter dimensions below)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Length (mm)</label>
                    <input 
                      type="number" 
                      value={pcbL} 
                      onChange={(e) => setPcbL(parseInt(e.target.value) || 0)} 
                      className="input-field" 
                      disabled={pcbBoard !== 'custom'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Width (mm)</label>
                    <input 
                      type="number" 
                      value={pcbW} 
                      onChange={(e) => setPcbW(parseInt(e.target.value) || 0)} 
                      className="input-field" 
                      disabled={pcbBoard !== 'custom'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Height (mm)</label>
                    <input 
                      type="number" 
                      value={pcbH} 
                      onChange={(e) => setPcbH(parseInt(e.target.value) || 0)} 
                      className="input-field" 
                      disabled={pcbBoard !== 'custom'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    id="vents-chk" 
                    checked={hasVents} 
                    onChange={(e) => setHasVents(e.target.checked)}
                    style={{ accentColor: '#000', cursor: 'pointer' }}
                  />
                  <label htmlFor="vents-chk" style={{ fontSize: '0.8rem', color: '#000', cursor: 'pointer' }}>
                    Include top heat dissipation vents (+₹99)
                  </label>
                </div>
              </div>
            )}

            {/* Chassis configurations */}
            {activePreset === 'chassis' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Plate Silhouette</label>
                  <select value={chassisShape} onChange={(e) => setChassisShape(e.target.value)} className="select-field">
                    <option value="rectangle">Standard Rectangle Plate</option>
                    <option value="circle">Circular Disc Plate</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plate Length (mm)</label>
                    <input type="number" value={chassisL} onChange={(e) => setChassisL(parseInt(e.target.value) || 0)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plate Width (mm)</label>
                    <input type="number" value={chassisW} onChange={(e) => setChassisW(parseInt(e.target.value) || 0)} className="input-field" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Motor Mount Brackets Holes</label>
                  <select value={motorMounts} onChange={(e) => setMotorMounts(parseInt(e.target.value))} className="select-field">
                    <option value="2">2-Wheel Drive (Standard Dual mounts)</option>
                    <option value="4">4-Wheel Drive (Quad corner mounts)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Drone configurations */}
            {activePreset === 'drone' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Frame Structure Type</label>
                  <select value={droneSize} onChange={(e) => setDroneSize(parseInt(e.target.value))} className="select-field">
                    <option value="quad">Quadcopter X-Configuration</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wheelbase Diameter (mm span)</label>
                  <input 
                    type="number" 
                    min="100" 
                    max="450" 
                    value={droneSize} 
                    onChange={(e) => setDroneSize(parseInt(e.target.value) || 100)} 
                    className="input-field" 
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical sizes: 130mm (Micro), 220mm (FPV Racing), 450mm (Cinematic)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Arm Plate Thickness (mm)</label>
                  <select value={armThickness} onChange={(e) => setArmThickness(parseInt(e.target.value))} className="select-field">
                    <option value="3">3 mm (Light weight / indoor)</option>
                    <option value="4">4 mm (Standard crash impact deflection)</option>
                    <option value="6">6 mm (Heavy duty / dual layers)</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={handleAddPresetToCart}
              className="btn-primary"
              style={{ width: '100%', height: '42px', marginTop: '1.5rem' }}
            >
              Add Blueprint Print to Cart
            </button>
          </div>
        </div>

        {/* Right Column: Drafting Canvas Schematic & Discount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Interactive Draft Canvas */}
          <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#000', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              2D Drafting Schematic
            </h3>
            
            <div style={{
              width: '100%',
              aspectRatio: '1.33',
              backgroundColor: '#fafafa',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <canvas
                ref={canvasRef}
                width={340}
                height={250}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              * CAD blueprint schematic auto-projects dimensions in real-time.
            </div>
          </div>

          {/* Student ID Code Verification */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Award size={18} style={{ color: '#000' }} />
              <h3 style={{ fontSize: '0.9rem', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Activate Student Discount
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Unlock flat 20% off all catalog items and custom components using your university email / registration details.
            </p>

            {idVerified || studentApplied ? (
              <div style={{
                border: '1px solid #000000', /* Monochromatic border */
                backgroundColor: '#fafafa',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#000000',
                fontWeight: '700'
              }}>
                <ShieldCheck size={16} />
                <span>Student rates applied: 20% Discount active.</span>
              </div>
            ) : (
              <form onSubmit={handleVerifyStudent} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  placeholder="Enter Student Registration ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="input-field"
                  style={{ height: '36px', fontSize: '0.8rem', borderColor: 'var(--border-color)' }}
                />
                <button type="submit" className="btn-secondary" style={{ height: '36px', padding: '0 1rem', fontSize: '0.8rem' }}>
                  Verify
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
