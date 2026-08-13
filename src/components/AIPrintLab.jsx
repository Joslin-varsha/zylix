import React from 'react';
import { Upload, HardDrive, Layers, Box, Award, Key, Gift, CheckCircle2, FileText, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const FONT_CATEGORIES = [
  {
    category: '✨ Modern & Clean (Sans-Serif)',
    fonts: [
      { id: 'Inter', name: 'Inter (Modern Standard)', family: "'Inter', system-ui, sans-serif" },
      { id: 'Montserrat', name: 'Montserrat (Geometric)', family: "'Montserrat', Arial, sans-serif" },
      { id: 'Poppins', name: 'Poppins (Rounded Clean)', family: "'Poppins', Verdana, sans-serif" },
      { id: 'Oswald', name: 'Oswald (Condensed Heavy)', family: "'Oswald', 'Arial Narrow', sans-serif" },
      { id: 'Raleway', name: 'Raleway (Elegant Thin/Bold)', family: "'Raleway', Helvetica, sans-serif" },
      { id: 'Roboto', name: 'Roboto (Universal Modern)', family: "'Roboto', sans-serif" },
      { id: 'Work Sans', name: 'Work Sans (Grotesque Sans)', family: "'Work Sans', sans-serif" },
      { id: 'Outfit', name: 'Outfit (Sleek Geometric)', family: "'Outfit', sans-serif" },
      { id: 'Rubik', name: 'Rubik (Soft Curved)', family: "'Rubik', sans-serif" },
      { id: 'Lexend', name: 'Lexend (Clean Minimalist)', family: "'Lexend', sans-serif" }
    ]
  },
  {
    category: '🏛️ Classic & Royal (Serif)',
    fonts: [
      { id: 'Playfair Display', name: 'Playfair Display (Luxury Serif)', family: "'Playfair Display', Georgia, serif" },
      { id: 'Cinzel', name: 'Cinzel (Roman Imperial)', family: "'Cinzel', 'Times New Roman', serif" },
      { id: 'Merriweather', name: 'Merriweather (Classic Editorial)', family: "'Merriweather', Georgia, serif" },
      { id: 'Bodoni Moda', name: 'Bodoni Moda (High Fashion)', family: "'Bodoni Moda', 'Didot', serif" },
      { id: 'Cormorant Garamond', name: 'Cormorant Garamond (Royal Calligraphic)', family: "'Cormorant Garamond', serif" },
      { id: 'Lora', name: 'Lora (Contemporary Serif)', family: "'Lora', Georgia, serif" },
      { id: 'Prata', name: 'Prata (Didone High Contrast)', family: "'Prata', serif" },
      { id: 'Marcellus', name: 'Marcellus (Flared Trajan Serif)', family: "'Marcellus', serif" }
    ]
  },
  {
    category: '📦 Bold 3D & Heavy Stencil',
    fonts: [
      { id: 'Anton', name: 'Anton (Ultra Heavy Block)', family: "'Anton', Impact, 'Arial Black', sans-serif" },
      { id: 'Bebas Neue', name: 'Bebas Neue (Tall Stencil)', family: "'Bebas Neue', Impact, sans-serif" },
      { id: 'Bungee', name: 'Bungee (3D Box Sign)', family: "'Bungee', 'Arial Black', cursive" },
      { id: 'Bungee Shade', name: 'Bungee Shade (3D Shadowed Block)', family: "'Bungee Shade', cursive" },
      { id: 'Black Ops One', name: 'Black Ops One (Military Stencil)', family: "'Black Ops One', Impact, cursive" },
      { id: 'Rubik Mono One', name: 'Rubik Mono One (Chunky 3D Block)', family: "'Rubik Mono One', monospace" },
      { id: 'Bangers', name: 'Bangers (Comic Superhero)', family: "'Bangers', Impact, cursive" },
      { id: 'Luckiest Guy', name: 'Luckiest Guy (Chunky Cartoon)', family: "'Luckiest Guy', cursive" },
      { id: 'Titan One', name: 'Titan One (Heavy Soft Block)', family: "'Titan One', sans-serif" },
      { id: 'Alfa Slab One', name: 'Alfa Slab One (Heavy Slab Serif)', family: "'Alfa Slab One', serif" }
    ]
  },
  {
    category: '✍️ Calligraphy & Cursive Script',
    fonts: [
      { id: 'Pacifico', name: 'Pacifico (Retro Surf Script)', family: "'Pacifico', 'Brush Script MT', cursive" },
      { id: 'Dancing Script', name: 'Dancing Script (Playful Flow)', family: "'Dancing Script', cursive" },
      { id: 'Great Vibes', name: 'Great Vibes (Formal Calligraphy)', family: "'Great Vibes', cursive" },
      { id: 'Lobster', name: 'Lobster (Bold Vintage Script)', family: "'Lobster', cursive" },
      { id: 'Satisfy', name: 'Satisfy (Handwritten Sign)', family: "'Satisfy', cursive" },
      { id: 'Caveat', name: 'Caveat (Casual Handwriting)', family: "'Caveat', cursive" },
      { id: 'Alex Brush', name: 'Alex Brush (Classic Calligraphy)', family: "'Alex Brush', cursive" },
      { id: 'Sacramento', name: 'Sacramento (Monoline Script)', family: "'Sacramento', cursive" },
      { id: 'Allura', name: 'Allura (Soft Elegant Script)', family: "'Allura', cursive" },
      { id: 'Parisienne', name: 'Parisienne (French Calligraphy)', family: "'Parisienne', cursive" },
      { id: 'Tangerine', name: 'Tangerine (Slanted Script)', family: "'Tangerine', cursive" },
      { id: 'Grand Hotel', name: 'Grand Hotel (Retro Script)', family: "'Grand Hotel', cursive" },
      { id: 'Cookie', name: 'Cookie (Sweet Handwritten)', family: "'Cookie', cursive" },
      { id: 'Yellowtail', name: 'Yellowtail (Flat Brush Script)', family: "'Yellowtail', cursive" },
      { id: 'Kaushan Script', name: 'Kaushan Script (Rustic Brush)', family: "'Kaushan Script', cursive" }
    ]
  },
  {
    category: '⚡ Tech, Cyberpunk & Gaming',
    fonts: [
      { id: 'Orbitron', name: 'Orbitron (Futuristic Sci-Fi)', family: "'Orbitron', sans-serif" },
      { id: 'Audiowide', name: 'Audiowide (Cyberpunk Synthwave)', family: "'Audiowide', sans-serif" },
      { id: 'Michroma', name: 'Michroma (Industrial Tech)', family: "'Michroma', sans-serif" },
      { id: 'Fira Code', name: 'Fira Code (Developer Code)', family: "'Fira Code', monospace" },
      { id: 'Press Start 2P', name: 'Press Start 2P (Retro 8-Bit Pixel)', family: "'Press Start 2P', monospace" },
      { id: 'Silkscreen', name: 'Silkscreen (Pixel Arcade)', family: "'Silkscreen', monospace" },
      { id: 'Share Tech Mono', name: 'Share Tech Mono (Console Terminal)', family: "'Share Tech Mono', monospace" }
    ]
  },
  {
    category: '🎨 Funky, Retro & Handdrawn',
    fonts: [
      { id: 'Permanent Marker', name: 'Permanent Marker (Sharpie Pen)', family: "'Permanent Marker', cursive" },
      { id: 'Righteous', name: 'Righteous (Smooth Retro)', family: "'Righteous', cursive" },
      { id: 'Monoton', name: 'Monoton (Multi-line Neon)', family: "'Monoton', cursive" },
      { id: 'Creepster', name: 'Creepster (Spooky Horror Stencil)', family: "'Creepster', cursive" },
      { id: 'Special Elite', name: 'Special Elite (Vintage Typewriter)', family: "'Special Elite', monospace" },
      { id: 'Rock Salt', name: 'Rock Salt (Felt Tip Marker)', family: "'Rock Salt', cursive" },
      { id: 'Shadows Into Light', name: 'Shadows Into Light (Neat Handwriting)', family: "'Shadows Into Light', cursive" },
      { id: 'Indie Flower', name: 'Indie Flower (Bubble Handwriting)', family: "'Indie Flower', cursive" },
      { id: 'Amatic SC', name: 'Amatic SC (Tall Condensed Sketch)', family: "'Amatic SC', cursive" }
    ]
  }
];

const ALL_FONTS = FONT_CATEGORIES.flatMap(cat => cat.fonts);
const getFontFamily = (fontId) => {
  const found = ALL_FONTS.find(f => f.id === fontId || f.name === fontId);
  return found ? found.family : "'Inter', system-ui, sans-serif";
};

export default function AIPrintLab({ 
  onAddToCart,
  onBuyNow,
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
  const [labSettings, setLabSettings] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/lab-settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setLabSettings(data);
        }
      })
      .catch(err => console.error('Failed to fetch lab settings on storefront:', err));
  }, []);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [customerName, setCustomerName] = React.useState('');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [validationError, setValidationError] = React.useState('');
  const errorRef = React.useRef(null);

  const triggerError = (msg) => {
    setValidationError(msg);
    setTimeout(() => {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

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
    setValidationError('');
    if (!file) {
      triggerError("Please upload a 3D model file (STL, OBJ, or 3MF) first.");
      return;
    }
    
    if (!customerName || customerName.trim().length < 2) {
      triggerError("Please enter a valid full name (at least 2 characters).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      triggerError("Please enter a valid email address.");
      return;
    }
    const phoneClean = customerPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      triggerError("Please enter a valid 10-digit contact phone number.");
      return;
    }

    setSubmittingQuote(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('material', material);
      formData.append('color', color);
      formData.append('quantity', quantity);
      formData.append('notes', notes);
      formData.append('customerName', customerName.trim());
      formData.append('customerEmail', customerEmail.trim());
      formData.append('customerPhone', phoneClean);

      const response = await fetch(`${API_BASE}/api/quotes/slicer`, {
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
      triggerError(err.message);
    } finally {
      setSubmittingQuote(false);
    }
  };


  // 2. --- PRODUCT DESIGNER (DESIGN YOUR OWN) STATES & HANDLERS ---
  const [productType, setProductType] = React.useState('keychain'); // 'keychain', 'nameboard', 'trophy', 'phonestand', 'other'
  const [customProductType, setCustomProductType] = React.useState('');
  const [nameText, setNameText] = React.useState(customizerText || 'ZYLIX 3D');
  const [selectedFont, setSelectedFont] = React.useState('Pacifico');
  const [designerColor, setDesignerColor] = React.useState('Gold'); // Text Color: 'Gold', 'White', 'Red', 'Blue', 'Pink', 'Green', 'Orange', 'Black', 'Other'
  const [baseColor, setBaseColor] = React.useState('Black'); // Base Contour Color: 'Black', 'White', 'Red', 'Navy', 'Gold'
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

  // Dynamically load selected Google Font into document head on demand
  React.useEffect(() => {
    if (selectedFont) {
      const fontNameFormatted = selectedFont.replace(/ /g, '+');
      const fontLinkId = `gfont-${selectedFont.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement('link');
        link.id = fontLinkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontNameFormatted}&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [selectedFont]);

  // Sync state with incoming preset from catalog customization redirect
  React.useEffect(() => {
    if (designerPreset) {
      setProductType(designerPreset);
    }
  }, [designerPreset]);

  const handleAddToCartDesigner = () => {
    if (productType === 'keychain' && !nameText.trim()) {
      triggerError("Please specify the custom text/name for your keychain before adding to cart.");
      return;
    }
    
    const price = 50; // Custom Keychain fixed static price = ₹50
    const imgMap = {
      keychain: '/images/categories/keychains.webp',
      nameboard: '/images/categories/stencils.jpg',
      phonestand: '/images/categories/holders.jpg',
      trophy: '/images/categories/gifts.jpg'
    };

    const finalTextColor = designerColor === 'Other' && customColor.trim() ? customColor.trim() : designerColor;

    const customItem = {
      id: `custom_${productType}_${Date.now()}`,
      name: `Custom 3D Keychain ("${nameText.trim() || 'Design'}")`,
      price: price,
      image: '/product-1.webp',
      isCustom: true,
      material: 'PLA Premium',
      infill: 20,
      resolution: '0.2mm High Quality',
      customText: nameText.trim(),
      customFont: selectedFont,
      textColor: finalTextColor,
      baseColor: baseColor,
      size: designerSize,
      quantity: 1
    };

    if (onAddToCart) {
      onAddToCart(customItem);
    }
  };

  const handleBuyNowDesigner = () => {
    if (productType === 'keychain' && !nameText.trim()) {
      triggerError("Please specify the custom text/name for your keychain before buying.");
      return;
    }
    
    const price = 50; // Custom Keychain fixed static price = ₹50
    const imgMap = {
      keychain: '/images/categories/keychains.webp',
      nameboard: '/images/categories/stencils.jpg',
      phonestand: '/images/categories/holders.jpg',
      trophy: '/images/categories/gifts.jpg'
    };

    const finalTextColor = designerColor === 'Other' && customColor.trim() ? customColor.trim() : designerColor;

    const customItem = {
      id: `custom_${productType}_${Date.now()}`,
      name: `Custom 3D Keychain ("${nameText.trim() || 'Design'}")`,
      price: price,
      image: '/product-1.webp',
      isCustom: true,
      material: 'PLA Premium',
      infill: 20,
      resolution: '0.2mm High Quality',
      customText: nameText.trim(),
      customFont: selectedFont,
      textColor: finalTextColor,
      baseColor: baseColor,
      size: designerSize,
      quantity: 1
    };

    if (onBuyNow) {
      onBuyNow(customItem);
    } else if (onAddToCart) {
      onAddToCart(customItem);
      if (setActiveTab) setActiveTab('checkout');
    }
  };

  const handleReferenceFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setReferenceFile(selectedFile);
    }
  };

  const handleSubmitDesignerQuote = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (productType === 'keychain' && !nameText.trim()) {
      triggerError("Please specify the text/name details for your custom design.");
      return;
    }
    if (productType === 'other' && !customProductType.trim()) {
      triggerError("Please specify the custom product type details.");
      return;
    }
    
    if (!customerName || customerName.trim().length < 2) {
      triggerError("Please enter a valid full name (at least 2 characters).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      triggerError("Please enter a valid email address.");
      return;
    }
    const phoneClean = customerPhone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      triggerError("Please enter a valid 10-digit contact phone number.");
      return;
    }

    setDesignerSubmitting(true);
    try {
      const formData = new FormData();
      if (referenceFile) {
        formData.append('referenceFile', referenceFile);
      }
      formData.append('productType', productType);
      formData.append('customProductType', customProductType.trim());
      formData.append('nameText', nameText.trim());
      formData.append('selectedFont', selectedFont);
      formData.append('designerColor', designerColor);
      formData.append('baseColor', baseColor);
      formData.append('customColor', customColor.trim());
      formData.append('additionalNotes', additionalNotes.trim());
      formData.append('customerName', customerName.trim());
      formData.append('customerEmail', customerEmail.trim());
      formData.append('customerPhone', phoneClean);

      const response = await fetch(`${API_BASE}/api/quotes/designer`, {
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
      triggerError(err.message);
    } finally {
      setDesignerSubmitting(false);
    }
  };

  return (
    <div className="print-lab-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '1rem 0.75rem 85px' : '2rem 1.5rem', boxSizing: 'border-box', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem', textAlign: 'center' }}>
        {activeLabTab === 'slicer' && (
          <>
            <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ZYLIX PRINT SERVICES</span>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000', lineHeight: '1.25' }}>Upload File to Print</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.4rem auto 0', fontSize: isMobile ? '0.8rem' : '0.9rem', lineHeight: '1.5' }}>
              Upload your custom CAD models (STL, OBJ, or 3MF) to request a custom printing quote from our manufacturing engineers.
            </p>
          </>
        )}
        {activeLabTab === 'designer' && (
          <>
            <span className="badge-outline" style={{ marginBottom: '0.5rem' }}>ZYLIX 3D DESIGNER</span>
            <h1 style={{ fontSize: isMobile ? '1.4rem' : '2.2rem', fontWeight: '800', textTransform: 'uppercase', color: '#000', lineHeight: '1.25' }}>Design Your Own Product</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.4rem auto 0', fontSize: isMobile ? '0.8rem' : '0.9rem', lineHeight: '1.5' }}>
              Submit your product specifications, sketches, custom text, and color choices to request a custom model draft and print quote.
            </p>
          </>
        )}
      </div>

      {/* Grid Content Panel */}
      <div className="print-lab-grid print-lab-main-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: isMobile ? '1.25rem' : '2.5rem',
        alignItems: 'start',
        width: '100%',
        boxSizing: 'border-box'
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
            <div className="glass-panel" style={{ padding: isMobile ? '1.25rem 0.85rem' : '2rem', backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
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

          {/* TAB 2: Design Live Preview Card (Shown ONLY for Keychain) */}
          {activeLabTab === 'designer' && (
            <div className="glass-panel" style={{ padding: isMobile ? '0.75rem' : '1rem', backgroundColor: '#ffffff', borderRadius: '12px', boxSizing: 'border-box', overflow: 'hidden', width: '100%' }}>
              {productType === 'keychain' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                      LIVE KEYCHAIN PREVIEW
                    </span>
                  </div>

                  {/* Keychain Viewport */}
                  <div style={{
                    width: '100%',
                    minHeight: '190px',
                    borderRadius: '10px',
                    background: '#e4eee0',
                    boxShadow: 'inset 0 1px 6px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '1.5rem 1rem',
                    overflow: 'hidden',
                    border: '1px solid #bbf7d0'
                  }}>
                    {/* Cutting Mat Grid background simulation */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'linear-gradient(rgba(22, 101, 52, 0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(22, 101, 52, 0.22) 1px, transparent 1px)',
                      backgroundSize: '22px 22px',
                      pointerEvents: 'none'
                    }} />

                    {/* KEYCHAIN ASSEMBLY VIEWPORT */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isMobile ? (nameText.length > 10 ? 'scale(0.68)' : 'scale(0.78)') : 'rotate(-4deg) scale(1.15)',
                      transformOrigin: 'center center',
                      padding: isMobile ? '0.3rem 0' : '1rem 0.5rem',
                      margin: '0 auto',
                      transition: 'all 0.3s ease',
                      maxWidth: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {/* SOLID 3D CHROME SILVER METALLIC SHORT KEYRING & CABLE CHAIN SVG */}
                      <svg width="95" height="46" viewBox="0 0 95 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginRight: '-22px', zIndex: 4, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }}>
                        <defs>
                          {/* 100% Solid Polished Silver Chrome Gradients */}
                          <linearGradient id="richSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="25%" stopColor="#e2e8f0" />
                            <stop offset="55%" stopColor="#94a3b8" />
                            <stop offset="85%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#334155" />
                          </linearGradient>
                          <linearGradient id="richWireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="40%" stopColor="#cbd5e1" />
                            <stop offset="75%" stopColor="#64748b" />
                            <stop offset="100%" stopColor="#334155" />
                          </linearGradient>
                        </defs>

                        {/* Smooth Polished Solid Silver Key Ring */}
                        <circle cx="22" cy="23" r="18" stroke="url(#richSilverGrad)" strokeWidth="4.5" fill="none" />
                        <circle cx="22" cy="23" r="15.8" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.9" />
                        <circle cx="22" cy="23" r="20.2" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.6" />

                        {/* Jump Ring 1 */}
                        <ellipse cx="41" cy="23" rx="4.5" ry="6.5" stroke="url(#richWireGrad)" strokeWidth="3" fill="none" />
                        <ellipse cx="41" cy="23" rx="4.5" ry="6.5" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.7" />

                        {/* Cable Chain Link 2 */}
                        <ellipse cx="51" cy="23" rx="6.5" ry="4.5" stroke="url(#richWireGrad)" strokeWidth="3" fill="none" />
                        <ellipse cx="51" cy="23" rx="6.5" ry="4.5" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.7" />

                        {/* Cable Chain Link 3 */}
                        <ellipse cx="61" cy="23" rx="4.5" ry="6.5" stroke="url(#richWireGrad)" strokeWidth="3" fill="none" />
                        <ellipse cx="61" cy="23" rx="4.5" ry="6.5" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.7" />

                        {/* Cable Chain Link 4 */}
                        <ellipse cx="71" cy="23" rx="6.5" ry="4.5" stroke="url(#richWireGrad)" strokeWidth="3" fill="none" />
                        <ellipse cx="71" cy="23" rx="6.5" ry="4.5" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.7" />

                        {/* End Jump Ring 5 */}
                        <circle cx="81" cy="23" r="5.5" stroke="url(#richWireGrad)" strokeWidth="3.2" fill="none" />
                        <circle cx="81" cy="23" r="5.5" stroke="#1e293b" strokeWidth="0.8" fill="none" opacity="0.7" />
                      </svg>

                      {/* Pure Contoured Text Silhouette Keychain (Touching Keyring Loop) */}
                      <div style={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.2rem 0.6rem 0.2rem 0.85rem',
                        filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.45))',
                        transition: 'all 0.25s ease'
                      }}>
                        {/* Integrated Mounting Hole Loop (Physically Touching First Letter) */}
                        <div style={{
                          position: 'absolute',
                          left: '2px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: baseColor === 'White' ? '#ffffff' : baseColor === 'Red' ? '#7f1d1d' : baseColor === 'Navy' ? '#0f172a' : baseColor === 'Gold' ? '#78350f' : '#1c130d',
                          border: '3.5px solid ' + (baseColor === 'White' ? '#cbd5e1' : '#09090b'),
                          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e4eee0' }} />
                        </div>

                        {/* 3D Extruded Top Text Layer */}
                        <div style={{
                          fontFamily: getFontFamily(selectedFont),
                          fontSize: isMobile ? (nameText.length > 15 ? '1.05rem' : nameText.length > 10 ? '1.25rem' : '1.55rem') : (nameText.length > 15 ? '1.4rem' : nameText.length > 10 ? '1.75rem' : '2.25rem'),
                          fontWeight: '800',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          color: designerColor === 'Gold' ? '#facc15' : designerColor === 'White' ? '#ffffff' : designerColor === 'Black' ? '#38bdf8' : designerColor === 'Red' ? '#ef4444' : designerColor === 'Blue' ? '#3b82f6' : designerColor === 'Pink' ? '#ec4899' : designerColor === 'Green' ? '#22c55e' : designerColor === 'Orange' ? '#f97316' : designerColor === 'Purple' ? '#a855f7' : (customColor || '#facc15'),
                          textShadow: (() => {
                            const contourHex = baseColor === 'White' ? '#f8fafc' : baseColor === 'Red' ? '#7f1d1d' : baseColor === 'Navy' ? '#0f172a' : baseColor === 'Gold' ? '#78350f' : '#1c130d';
                            const shadowHex = baseColor === 'White' ? '#cbd5e1' : '#090604';
                            return `-3px -3px 0 ${contourHex}, 3px -3px 0 ${contourHex}, -3px 3px 0 ${contourHex}, 3px 3px 0 ${contourHex}, -4px 0px 0 ${contourHex}, 4px 0px 0 ${contourHex}, 0px -4px 0 ${contourHex}, 0px 4px 0 ${contourHex}, 2px 4px 0px ${shadowHex}, 3px 5px 8px rgba(0,0,0,0.6)`;
                          })(),
                          transition: 'all 0.25s ease',
                          lineHeight: '1.1',
                          paddingLeft: '0.4rem'
                        }}>
                          {nameText}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* CLEAN DESIGN STUDIO GUIDE FOR OTHER PRODUCT TYPES */
                <div style={{ padding: '0.5rem 0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}>
                      <Box size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#000', margin: 0, textTransform: 'capitalize' }}>
                        Custom {productType === 'other' ? (customProductType || 'Product') : productType} Studio
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        3D Manufacturing & Custom Specifications
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem', color: '#334155' }}>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '2px' }}>🛠️ Engineering Customization</span>
                      Submit your text, sketch, logo or dimensions. Our design team will model your 3D CAD object.
                    </div>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '2px' }}>📄 PDF Engineering Quote</span>
                      You will receive an official price quote & CAD preview dispatched directly to your contact details.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL: Form configurations depending on selected Tab */}
        <div className="glass-panel" style={{ padding: isMobile ? '1.25rem 0.85rem' : '2rem', backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', boxSizing: 'border-box' }}>
          
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
                    {((labSettings?.slicerMaterials && labSettings.slicerMaterials.length > 0)
                      ? labSettings.slicerMaterials
                      : ['PLA', 'ABS', 'PETG', 'Resin', 'Carbon Fiber', 'Nylon']
                    ).map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>

                {/* Filament Color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#000' }}>2. Material Color</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} className="select-field" style={{ borderRadius: '6px', height: '36px', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    {((labSettings?.slicerColors && labSettings.slicerColors.length > 0)
                      ? labSettings.slicerColors
                      : ['Matte Black', 'Arctic White', 'Industrial Silver', 'Crimson Red', 'Royal Blue', 'Silk Gold']
                    ).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
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

                {validationError && (
                  <div 
                    ref={errorRef}
                    style={{
                      padding: '0.8rem 1rem',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#b91c1c',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'fadeInUp 0.25s ease-out',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <XCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{validationError}</span>
                  </div>
                )}

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
                  setNameText('ZYLIX 3D');
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', minWidth: 0 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>What would you like to create?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(76px, 1fr))' : 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.35rem', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    {((labSettings?.productTypes && labSettings.productTypes.length > 0)
                      ? labSettings.productTypes.filter(p => p.enabled !== false).map(p => ({
                          id: p.id,
                          label: p.label.replace(/^[\p{Emoji}\s]+/gu, '') || p.label,
                          icon: p.id === 'keychain' ? <Key size={14} /> : p.id === 'nameboard' ? <Gift size={14} /> : p.id === 'trophy' ? <Award size={14} /> : p.id === 'phonestand' ? <Box size={14} /> : <FileText size={14} />
                        }))
                      : [
                          { id: 'keychain', label: 'Keychain', icon: <Key size={14} /> },
                          { id: 'nameboard', label: 'Name Board', icon: <Gift size={14} /> },
                          { id: 'trophy', label: 'Trophy', icon: <Award size={14} /> },
                          { id: 'phonestand', label: 'Phone Stand', icon: <Box size={14} /> },
                          { id: 'other', label: 'Other', icon: <FileText size={14} /> }
                        ]
                    ).map(p => (
                      <button
                        key={p.id} 
                        type="button" 
                        onClick={() => setProductType(p.id)}
                        style={{
                          padding: '0.5rem 0.2rem', 
                          fontSize: '0.72rem',
                          background: productType === p.id ? '#000' : 'transparent',
                          color: productType === p.id ? '#fff' : '#000',
                          border: '1px solid ' + (productType === p.id ? '#000' : 'var(--border-color)'),
                          cursor: 'pointer', 
                          borderRadius: '6px',
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '4px',
                          fontWeight: '600',
                          minWidth: 0,
                          width: '100%',
                          boxSizing: 'border-box',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {p.icon} <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%', display: 'block', textAlign: 'center' }}>{p.label}</span>
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

                {/* Custom text & Font Selector (Needed ONLY for Keychain) */}
                {productType === 'keychain' && (
                  <>
                    {/* Custom text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Enter Name / Text</label>
                      <input
                        type="text"
                        className="input-field"
                        value={nameText}
                        onChange={(e) => setNameText(e.target.value)}
                        placeholder='e.g. "ZYLIX 3D"'
                        style={{ fontSize: '0.82rem', height: '36px', borderRadius: '6px' }}
                        required
                      />
                    </div>

                    {/* Font Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Select Font Style</label>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                          Selected: <strong style={{ color: '#0f172a', fontFamily: getFontFamily(selectedFont) }}>{selectedFont}</strong>
                        </span>
                      </div>

                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="select-field"
                        style={{
                          borderRadius: '6px',
                          height: '38px',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.82rem',
                          fontFamily: getFontFamily(selectedFont),
                          fontWeight: '600',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        {FONT_CATEGORIES.map((catGroup) => (
                          <optgroup key={catGroup.category} label={catGroup.category} style={{ fontWeight: 'bold', color: '#000' }}>
                            {catGroup.fonts.map((f) => (
                              <option key={f.id} value={f.id} style={{ fontFamily: f.family, fontSize: '0.9rem' }}>
                                {f.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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

                {/* Dual Color Choices (Top Text & Baseplate Outline) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* 1. Top Text Color */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>1. Text Color</label>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Selected: <strong>{designerColor}</strong></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '0.35rem' }}>
                      {((labSettings?.textColors && labSettings.textColors.length > 0)
                        ? [...labSettings.textColors, { name: 'Other', hex: 'linear-gradient(45deg, #ef4444, #3b82f6)' }]
                        : [
                            { name: 'Gold', hex: '#facc15' },
                            { name: 'White', hex: '#ffffff' },
                            { name: 'Red', hex: '#ef4444' },
                            { name: 'Blue', hex: '#3b82f6' },
                            { name: 'Pink', hex: '#ec4899' },
                            { name: 'Green', hex: '#22c55e' },
                            { name: 'Orange', hex: '#f97316' },
                            { name: 'Purple', hex: '#a855f7' },
                            { name: 'Black', hex: '#18181b' },
                            { name: 'Other', hex: 'linear-gradient(45deg, #ef4444, #3b82f6)' }
                          ]
                      ).map(c => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setDesignerColor(c.name)}
                          style={{
                            padding: '0.35rem 0.2rem',
                            fontSize: '0.7rem',
                            background: designerColor === c.name ? '#0f172a' : '#f8fafc',
                            color: designerColor === c.name ? '#ffffff' : '#334155',
                            border: '1.5px solid ' + (designerColor === c.name ? '#0f172a' : '#cbd5e1'),
                            borderRadius: '6px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: '1px solid rgba(0,0,0,0.2)',
                            display: 'inline-block',
                            flexShrink: 0
                          }} />
                          {c.name}
                        </button>
                      ))}
                    </div>

                    {designerColor === 'Other' && (
                      <input
                        type="text"
                        className="input-field animate-fadeIn"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder='e.g. "Silky Bronze", "Neon Yellow"'
                        style={{ fontSize: '0.82rem', height: '34px', borderRadius: '6px', marginTop: '0.2rem' }}
                        required={designerColor === 'Other'}
                      />
                    )}
                  </div>

                  {/* 2. Baseplate Contour Backing Color */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>2. Base Contour Color</label>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Selected: <strong>{baseColor}</strong></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '0.35rem' }}>
                      {((labSettings?.baseColors && labSettings.baseColors.length > 0)
                        ? labSettings.baseColors
                        : [
                            { name: 'Black', hex: '#1c130d' },
                            { name: 'White', hex: '#f8fafc' },
                            { name: 'Red', hex: '#7f1d1d' },
                            { name: 'Navy', hex: '#0f172a' },
                            { name: 'Gold', hex: '#78350f' }
                          ]
                      ).map(bc => (
                        <button
                          key={bc.name}
                          type="button"
                          onClick={() => setBaseColor(bc.name)}
                          style={{
                            padding: '0.35rem 0.2rem',
                            fontSize: '0.7rem',
                            background: baseColor === bc.name ? '#0f172a' : '#f8fafc',
                            color: baseColor === bc.name ? '#ffffff' : '#334155',
                            border: '1.5px solid ' + (baseColor === bc.name ? '#0f172a' : '#cbd5e1'),
                            borderRadius: '6px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{
                            width: '9px',
                            height: '9px',
                            borderRadius: '50%',
                            background: bc.hex,
                            border: '1px solid rgba(0,0,0,0.2)',
                            display: 'inline-block',
                            flexShrink: 0
                          }} />
                          {bc.name}
                        </button>
                      ))}
                    </div>
                  </div>
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

                {/* Contact Details — only required for non-keychain custom quote requests */}
                {productType !== 'keychain' && (
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
                )}

                {validationError && (
                  <div 
                    ref={errorRef}
                    style={{
                      padding: '0.8rem 1rem',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#b91c1c',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'fadeInUp 0.25s ease-out',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <XCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Action Buttons: Keychain has instant Buy Now (₹50) & Add to Cart (₹50), others have Request Quote */}
                {productType === 'keychain' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.6rem', width: '100%' }}>
                      <button
                        type="button"
                        onClick={handleAddToCartDesigner}
                        style={{
                          width: '100%',
                          flex: isMobile ? 'none' : 1,
                          height: isMobile ? '38px' : '46px',
                          fontSize: isMobile ? '0.80rem' : '0.88rem',
                          fontWeight: '800',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      >
                        🛒 Add to Cart (₹50)
                      </button>
                      <button
                        type="button"
                        onClick={handleBuyNowDesigner}
                        style={{
                          width: '100%',
                          flex: isMobile ? 'none' : 1.2,
                          height: isMobile ? '38px' : '46px',
                          fontSize: isMobile ? '0.82rem' : '0.90rem',
                          fontWeight: '900',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          letterSpacing: '0.02em',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#000000'; }}
                      >
                        ⚡ BUY NOW (₹50)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '1.25rem' }}>
                    {user ? (
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', height: '48px', fontSize: '0.92rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: '12px' }}
                        disabled={designerSubmitting || !customerName || !customerEmail || !customerPhone}
                      >
                        📋 {designerSubmitting ? 'Sending Request...' : 'Request Custom Design & Quote'}
                      </button>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          style={{
                            width: '100%',
                            height: '46px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.85rem'
                          }}
                        >
                          🔒 Sign In to Submit Quote Request
                        </button>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                          *Sign in is required to submit custom print quotes & track order status.
                        </span>
                      </div>
                    )}
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
