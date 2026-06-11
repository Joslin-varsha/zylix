import React from 'react';
import { Upload, HardDrive, Layers, ShoppingCart } from 'lucide-react';

export default function AIPrintLab({ onAddToCart }) {
  const [file, setFile] = React.useState(null);
  const [isScanning, setIsScanning] = React.useState(false);
  
  // Custom print configuration states
  const [material, setMaterial] = React.useState('PLA');
  const [infill, setInfill] = React.useState(20);
  const [layerHeight, setLayerHeight] = React.useState('0.20');
  const [color, setColor] = React.useState('Matte Black');

  // Simulated file stats
  const [fileStats, setFileStats] = React.useState({
    name: '',
    volume: 0,
    dimensions: { x: 0, y: 0, z: 0 },
    weight: 0
  });

  const canvasRef = React.useRef(null);
  const animationRef = React.useRef(null);

  // File templates for quick select simulation
  const mockCADTemplates = [
    { name: "ergonomic_mouse_shell.stl", x: 124, y: 68, z: 42, volume: 48.5 },
    { name: "turbine_fan_impeller.obj", x: 95, y: 95, z: 30, volume: 38.2 },
    { name: "gopro_helmet_mount.3mf", x: 55, y: 45, z: 35, volume: 18.0 }
  ];

  // Perform upload scan simulation
  const simulateUpload = (fileName, volume, x, y, z) => {
    setIsScanning(true);
    setFile(null);
    setTimeout(() => {
      setIsScanning(false);
      setFile({ name: fileName });
      setFileStats({
        name: fileName,
        volume: volume,
        dimensions: { x, y, z },
        weight: Math.round(volume * 1.25) // approx PLA density 1.25g/cm3
      });
    }, 1800);
  };

  // Drag and drop events
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      simulateUpload(
        droppedFile.name, 
        Math.floor(15 + Math.random() * 60), 
        Math.floor(40 + Math.random() * 100),
        Math.floor(40 + Math.random() * 100),
        Math.floor(20 + Math.random() * 60)
      );
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      simulateUpload(
        selectedFile.name,
        Math.floor(15 + Math.random() * 60), 
        Math.floor(40 + Math.random() * 100),
        Math.floor(40 + Math.random() * 100),
        Math.floor(20 + Math.random() * 60)
      );
    }
  };

  // Pricing calculations
  const calculatePrice = () => {
    if (!file) return 0;
    
    // Rates per gram
    const rates = { PLA: 6, ABS: 8, PETG: 10, Resin: 18 };
    const materialRate = rates[material] || 6;
    
    // Infill multiplier
    const infillFactor = 0.4 + (infill / 100) * 0.6;
    
    // Layer height factor
    const layerFactors = { '0.08': 1.4, '0.12': 1.2, '0.20': 1.0, '0.28': 0.85 };
    const layerFactor = layerFactors[layerHeight] || 1.0;

    const baseWeight = fileStats.weight * infillFactor;
    const finalPrice = Math.round((baseWeight * materialRate * layerFactor) + 150); // ₹150 base setup machine cost
    return {
      weight: Math.round(baseWeight),
      price: finalPrice,
      printTime: Math.round((baseWeight * 12 * layerFactor) / 60) // in hours
    };
  };

  const priceDetails = calculatePrice();

  const handleAddToCart = () => {
    if (!file) return;
    const customItem = {
      id: 'custom-' + Date.now(),
      name: `Custom CAD [${fileStats.name}]`,
      isCustom: true,
      price: priceDetails.price,
      quantity: 1,
      material: material,
      infill: infill,
      resolution: `${layerHeight}mm`,
      color: color,
      image: null
    };
    onAddToCart(customItem);
    alert('Custom 3D Print added to Cart!');
  };

  // 3D Canvas rendering loop (Upgraded to dynamic layer-by-layer FDM printing simulator)
  React.useEffect(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let angleX = 0.4; // set stable isometric tilt angles
    let angleY = 0.5;
    let printProgress = 0; // percentage 0 - 100
    let pauseCounter = 0;

    // Define 3D wireframe cube vertices relative to origin
    const size = 50;
    // Z-axis goes from -size (bottom) to size (top)
    const vertices = [
      [-size, -size, -size], // 0: bottom back left
      [size, -size, -size],  // 1: bottom back right
      [size, size, -size],   // 2: bottom front right
      [-size, size, -size],  // 3: bottom front left
      [-size, -size, size],  // 4: top back left
      [size, -size, size],   // 5: top back right
      [size, size, size],    // 6: top front right
      [-size, size, size]    // 7: top front left
    ];

    // Connect vertices to draw lines of a cube
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
      [4, 5], [5, 6], [6, 7], [7, 4], // Top face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Vertical structural columns
    ];

    const rotateX = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const [x, y, z] = point;
      return [
        x,
        y * cos - z * sin,
        y * sin + z * cos
      ];
    };

    const rotateY = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const [x, y, z] = point;
      return [
        x * cos + z * sin,
        y,
        -x * sin + z * cos
      ];
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Dynamic slow rotation around Y-axis for depth
      angleY += 0.005;

      // Update simulated print progress
      if (printProgress < 100) {
        printProgress += 0.5; // speed of print
      } else {
        pauseCounter++;
        if (pauseCounter > 120) { // Hold finished state for 2 seconds (120 frames)
          printProgress = 0;
          pauseCounter = 0;
        }
      }

      // Calculate current printing cut-off height along the Z-axis (from -size to size)
      const currentHeightCutoff = -size + (size * 2) * (printProgress / 100);

      // Project vertices to 2D canvas coordinates
      const projected = vertices.map(vert => {
        let rotated = rotateX(vert, angleX);
        rotated = rotateY(rotated, angleY);
        
        // Perspective calculation
        const distance = 220;
        const fov = 160;
        const zScale = fov / (distance + rotated[2]);
        
        return [
          width / 2 + rotated[0] * zScale,
          height / 2 + rotated[1] * zScale - 20
        ];
      });

      // Draw Grid Base bed (heated plate in light grey)
      ctx.strokeStyle = '#e2e2e2';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        // Render grid bed lines
        ctx.beginPath();
        ctx.moveTo(width/2 - 80 + i*4, height/2 + 50 + i*5);
        ctx.lineTo(width/2 + 80 + i*4, height/2 + 50 + i*5);
        ctx.stroke();
      }

      // Draw horizontal cross section lines grid for bed reference
      ctx.beginPath();
      ctx.moveTo(width/2 - 80, height/2 + 50);
      ctx.lineTo(width/2, height/2 + 80);
      ctx.lineTo(width/2 + 80, height/2 + 50);
      ctx.lineTo(width/2, height/2 + 20);
      ctx.closePath();
      ctx.stroke();

      // Render wireframe edges based on slicing progress
      edges.forEach(([u, v]) => {
        const z1 = vertices[u][2];
        const z2 = vertices[v][2];

        // Case 1: Both points printed
        if (z1 <= currentHeightCutoff && z2 <= currentHeightCutoff) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(projected[u][0], projected[u][1]);
          ctx.lineTo(projected[v][0], projected[v][1]);
          ctx.stroke();
        }
        // Case 2: Edge crosses the current print boundary
        else if ((z1 <= currentHeightCutoff && z2 > currentHeightCutoff) || (z2 <= currentHeightCutoff && z1 > currentHeightCutoff)) {
          const t = (currentHeightCutoff - z1) / (z2 - z1);
          // Interpolate the 3D position
          const xInt = vertices[u][0] + (vertices[v][0] - vertices[u][0]) * t;
          const yInt = vertices[u][1] + (vertices[v][1] - vertices[u][1]) * t;
          const zInt = currentHeightCutoff;

          // Project the interpolated point
          let rotInt = rotateX([xInt, yInt, zInt], angleX);
          rotInt = rotateY(rotInt, angleY);
          const zScale = 160 / (220 + rotInt[2]);
          const pxInt = width / 2 + rotInt[0] * zScale;
          const pyInt = height / 2 + rotInt[1] * zScale - 20;

          // Draw active printed segment
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(z1 <= currentHeightCutoff ? projected[u][0] : projected[v][0], z1 <= currentHeightCutoff ? projected[u][1] : projected[v][1]);
          ctx.lineTo(pxInt, pyInt);
          ctx.stroke();

          // Draw remaining unprinted outline segment as light dashed line
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(pxInt, pyInt);
          ctx.lineTo(z1 > currentHeightCutoff ? projected[u][0] : projected[v][0], z1 > currentHeightCutoff ? projected[u][1] : projected[v][1]);
          ctx.stroke();
        }
        // Case 3: Both above cutoff (unprinted shadow outline)
        else {
          ctx.strokeStyle = '#eaeaea';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(projected[u][0], projected[u][1]);
          ctx.lineTo(projected[v][0], projected[v][1]);
          ctx.stroke();
        }
      });

      // Reset dash style
      ctx.setLineDash([]);

      // Draw the active printing build horizontal plane indicator line
      if (printProgress < 100) {
        // Project the boundary corners of the print cross-section
        const corners = [
          [-size, -size, currentHeightCutoff],
          [size, -size, currentHeightCutoff],
          [size, size, currentHeightCutoff],
          [-size, size, currentHeightCutoff]
        ];

        const projCorners = corners.map(pt => {
          let rot = rotateX(pt, angleX);
          rot = rotateY(rot, angleY);
          const zScale = 160 / (220 + rot[2]);
          return [width / 2 + rot[0] * zScale, height / 2 + rot[1] * zScale - 20];
        });

        // Draw cross-section scanning halo ring (Pure Monochrome)
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(projCorners[0][0], projCorners[0][1]);
        projCorners.forEach(pt => ctx.lineTo(pt[0], pt[1]));
        ctx.closePath();
        ctx.stroke();

        // Simulate active extruder nozzle tracing path in real-time coordinates
        const timeFactor = Date.now() / 150;
        const index = Math.floor(timeFactor % 4);
        const nextIdx = (index + 1) % 4;
        const fraction = (timeFactor % 1);

        // Interpolate nozzle X/Y path coordinate
        const nozzleX = projCorners[index][0] + (projCorners[nextIdx][0] - projCorners[index][0]) * fraction;
        const nozzleY = projCorners[index][1] + (projCorners[nextIdx][1] - projCorners[index][1]) * fraction;

        // Draw nozzle structure (stark black lines pointing down)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(nozzleX, nozzleY);
        ctx.lineTo(nozzleX - 8, nozzleY - 15);
        ctx.lineTo(nozzleX + 8, nozzleY - 15);
        ctx.closePath();
        ctx.fill();

        // Draw extrusion filament line tracing
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(nozzleX, nozzleY - 15);
        ctx.lineTo(nozzleX, nozzleY - 45);
        ctx.stroke();

        // Draw active laser point flash circle (Pure Monochrome white/black flash)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nozzleX, nozzleY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // Display live rendering data readouts (monospace console text)
      ctx.fillStyle = '#111111';
      ctx.font = '9px monospace';
      ctx.fillText(`LAYER HEIGHT: ${layerHeight}mm`, 10, 18);
      ctx.fillText(`FEED SPEED  : 150mm/s`, 10, 30);
      ctx.fillText(`PROGRESS    : ${Math.round(printProgress)}%`, 10, 42);
      ctx.fillText(`EXTRUDER    : 215°C / BED: 60°C`, 10, 54);

      // Coordinate axes indicator in bottom right
      ctx.fillStyle = '#888888';
      ctx.fillText(`X: ${(Math.sin(Date.now() / 100) * 10).toFixed(2)}`, width - 80, height - 38);
      ctx.fillText(`Y: ${(Math.cos(Date.now() / 150) * 10).toFixed(2)}`, width - 80, height - 26);
      ctx.fillText(`Z: ${(printProgress * (fileStats.dimensions.z / 100)).toFixed(2)}mm`, width - 80, height - 14);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [file, fileStats, layerHeight]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>AI PRICING LAB</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000' }}>AI-Powered 3D Print Calculator</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          Upload STL, OBJ, or 3MF files. Our automated calculator analyzes bounding boxes and geometry grids to output a precise production invoice.
        </p>
      </div>

      <div className="print-lab-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Upload & 3D Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Upload Drop Area */}
          {!file && !isScanning && (
            <div 
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('active'); }}
              onDrop={handleDrop}
              className="upload-zone"
              style={{ padding: '4.5rem 2rem' }}
            >
              <Upload size={40} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#000', marginBottom: '0.5rem' }}>Upload CAD / mesh files</h3>
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

          {/* Scanning Animation */}
          {isScanning && (
            <div className="glass-panel" style={{
              padding: '4.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '260px'
            }}>
              <div className="scanning-bar" />
              <Upload size={32} className="animate-pulse-slow" style={{ color: '#000', marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1rem', color: '#000', letterSpacing: '0.05em' }}>AI ANALYZING MESH GEOMETRY</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Calculating volume density, layers, and wall tolerances...
              </p>
            </div>
          )}

          {/* 3D Wireframe Viewer Canvas */}
          {file && !isScanning && (
            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#000' }}>{file.name}</span>
                <button 
                  onClick={() => setFile(null)} 
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: '#000',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Change File
                </button>
              </div>

              {/* Spinning Canvas */}
              <div style={{
                position: 'relative',
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

              {/* File details checklist below */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1rem',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardDrive size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Calculated Vol: </span>
                    <span style={{ fontWeight: '600', color: '#000' }}>{fileStats.volume} cm³</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={14} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Est. Weight: </span>
                    <span style={{ fontWeight: '600', color: '#000' }}>{fileStats.weight}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick templates presets to test with */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              No STL on hand? Try a template:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mockCADTemplates.map((temp, index) => (
                <button
                  key={index}
                  onClick={() => simulateUpload(temp.name, temp.volume, temp.x, temp.y, temp.z)}
                  className="btn-secondary"
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    width: '100%'
                  }}
                  disabled={isScanning}
                >
                  Load {temp.name} ({temp.x}x{temp.y}x{temp.z}mm)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Print parameter configuration forms */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#000', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Parameters & Config
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 1. Material Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>1. Print Material</label>
              <select 
                value={material} 
                onChange={(e) => setMaterial(e.target.value)} 
                className="select-field"
              >
                <option value="PLA">PLA (Polylactic Acid) - Basic Prototyping</option>
                <option value="ABS">ABS (Acrylonitrile Butadiene Styrene) - Heat & Strength</option>
                <option value="PETG">PETG (Polyethylene Terephthalate Glycol) - Tough Outdoors</option>
                <option value="Resin">Resin (Photopolymer) - Ultra High Resolution Detail</option>
              </select>
            </div>

            {/* 2. Color Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>2. Filament Color</label>
              <select 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="select-field"
              >
                <option value="Matte Black">Matte Black</option>
                <option value="Arctic White">Arctic White</option>
                <option value="Industrial Silver">Industrial Silver</option>
                <option value="Crimson Red">Crimson Red</option>
              </select>
            </div>

            {/* 3. Infill Density Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>3. Infill Density</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#000' }}>{infill}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5" 
                value={infill} 
                onChange={(e) => setInfill(parseInt(e.target.value))}
                style={{ 
                  width: '100%', 
                  accentColor: '#000', 
                  background: 'var(--border-color)',
                  height: '4px',
                  outline: 'none',
                  cursor: 'pointer'
                }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>10% (Visual/Light)</span>
                <span>40% (Structural)</span>
                <span>100% (Solid Steel-like)</span>
              </div>
            </div>

            {/* 4. Layer Resolution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#000' }}>4. Layer Height (Resolution)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: "0.28mm (Coarse)", val: "0.28" },
                  { label: "0.20mm (Standard)", val: "0.20" },
                  { label: "0.12mm (Fine)", val: "0.12" },
                  { label: "0.08mm (Ultra)", val: "0.08" }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setLayerHeight(item.val)}
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      background: layerHeight === item.val ? '#000' : 'transparent',
                      color: layerHeight === item.val ? '#fff' : '#000',
                      border: '1px solid ' + (layerHeight === item.val ? '#000' : 'var(--border-color)'),
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price breakdown display */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem',
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Calculated Print Weight</span>
                <span style={{ color: '#000' }}>{file ? `${priceDetails.weight}g` : '0g'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Print Duration</span>
                <span style={{ color: '#000' }}>{file ? `${priceDetails.printTime} Hours` : '0 Hours'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Material Rate</span>
                <span style={{ color: '#000' }}>{material} @ ₹{material === 'PLA' ? '6' : material === 'ABS' ? '8' : material === 'PETG' ? '10' : '18'}/g</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: '700',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '0.75rem',
                fontFamily: 'var(--font-display)',
                color: '#000'
              }}>
                <span>Instant Quote</span>
                <span>₹{file ? priceDetails.price.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>

            {/* Submission Actions */}
            <button
              onClick={handleAddToCart}
              className="btn-primary"
              style={{ width: '100%', height: '48px', marginTop: '0.5rem' }}
              disabled={!file}
            >
              <ShoppingCart size={16} /> Add Custom Print to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
