import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ECommerceCatalog from './components/ECommerceCatalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CartPage from './components/CartPage';
import AIPrintLab from './components/AIPrintLab';

import SpareParts from './components/SpareParts';
import StudentHub from './components/StudentHub';
import MyOrders from './components/MyOrders';
import LoginView from './components/LoginView';
import TrustBadges from './components/TrustBadges';
import InfoPage from './components/InfoPage';
import { X, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';

// Error Boundary — shows error message instead of blank page
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'monospace', backgroundColor: '#fff0f0', border: '2px solid red', margin: '2rem', borderRadius: '8px' }}>
          <h2 style={{ color: 'red' }}>⚠️ Something went wrong</h2>
          <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#333' }}>
            {this.state.error?.message}
          </pre>
          <button onClick={() => this.setState({ hasError: false })} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState('shop');
  const [activeCategory, setActiveCategory] = React.useState('home');
  const lastPathRef = React.useRef('');
  const lastStateRef = React.useRef({ tab: 'shop', category: 'home' });
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Shopping Cart & User profile state
  const [cartItems, setCartItems] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [studentApplied, setStudentApplied] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [cartLoaded, setCartLoaded] = React.useState(false);
  
  // States: Login, Wishlist & Toggles
  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('zylix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wishlist, setWishlist] = React.useState([]);

  // Fetch cart from backend on mount or user login
  React.useEffect(() => {
    const fetchCart = async () => {
      if (user && user.email) {
        try {
          const res = await fetch(`${API_BASE}/api/cart?email=${encodeURIComponent(user.email)}`);
          if (res.ok) {
            const items = await res.json();
            setCartItems(items || []);
          }
        } catch (err) {
          console.error('Failed to fetch user cart from backend:', err);
        } finally {
          setCartLoaded(true);
        }
      } else {
        setCartItems([]);
        setCartLoaded(true);
      }
    };

    fetchCart();
  }, [user]);

  // Sync cart to backend on cart changes (only after backend cart is loaded)
  React.useEffect(() => {
    const syncCart = async () => {
      if (user && user.email && cartLoaded) {
        try {
          await fetch(`${API_BASE}/api/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              items: cartItems
            })
          });
        } catch (err) {
          console.error('Failed to sync cart to backend:', err);
        }
      }
    };

    syncCart();
  }, [cartItems, user, cartLoaded]);
  const [wishlistOpen, setWishlistOpen] = React.useState(false);
  const [loginMessage, setLoginMessage] = React.useState('');
  const [welcomeToast, setWelcomeToast] = React.useState('');

  // Customizer & AI Lab state extensions
  const [labTab, setLabTab] = React.useState('slicer'); // 'slicer', 'designer', 'generator'
  const [designerPreset, setDesignerPreset] = React.useState('keychain'); // 'keychain', 'nameboard', 'phonestand', 'trophy'
  const [customizerText, setCustomizerText] = React.useState('');

  const handleCustomizeProduct = (product) => {
    setActiveTab('designer');
    
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('keychain') || nameLower.includes('tag')) {
      setDesignerPreset('keychain');
      setCustomizerText('MY KEYCHAIN');
    } else if (nameLower.includes('plaque') || nameLower.includes('board') || nameLower.includes('plate') || nameLower.includes('stencil')) {
      setDesignerPreset('nameboard');
      setCustomizerText('JOSLIN VARSHA');
    } else if (nameLower.includes('stand') || nameLower.includes('holder') || nameLower.includes('dock')) {
      setDesignerPreset('phonestand');
      setCustomizerText('STAND');
    } else if (nameLower.includes('trophy') || nameLower.includes('award')) {
      setDesignerPreset('trophy');
      setCustomizerText('CHAMPION');
    } else if (nameLower.includes('box') || nameLower.includes('light')) {
      setDesignerPreset('nameboard');
      setCustomizerText('GLOW LIGHT');
    } else {
      setDesignerPreset('keychain');
      setCustomizerText('CUSTOM');
    }
  };

  React.useEffect(() => {
    if (welcomeToast) {
      const timer = setTimeout(() => setWelcomeToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [welcomeToast]);

  // Synchronize URL pathname with activeTab state using React Router (preventing loops)
  React.useEffect(() => {
    const currentPath = location.pathname;
    const pathKey = currentPath.replace(/^\//, '');
    
    // Check if the URL changed since last run
    const urlChanged = currentPath !== lastPathRef.current;
    // Check if the state changed since last run
    const stateChanged = activeTab !== lastStateRef.current.tab || activeCategory !== lastStateRef.current.category;

    if (urlChanged && !stateChanged) {
      // URL changed (initial load or back/forward browser navigation)
      let newTab = 'shop';
      let newCategory = activeCategory;
      
      const validTabs = [
        'shop', 'products', 'ailab', 'designer', 'spareparts', 'student', 'orders', 'cart', 'login',
        'about', 'faq', 'contact', 'refund', 'shipping', 'privacy', 'terms'
      ];

      if (pathKey === 'products') {
        newTab = 'shop';
        newCategory = 'all';
      } else if (pathKey && validTabs.includes(pathKey)) {
        newTab = pathKey;
      } else if (!pathKey) {
        newTab = 'shop';
        newCategory = 'home';
      }

      if (activeTab !== newTab) setActiveTab(newTab);
      if (activeCategory !== newCategory) setActiveCategory(newCategory);

      lastPathRef.current = currentPath;
      lastStateRef.current = { tab: newTab, category: newCategory };
    } 
    else if (stateChanged) {
      // React state changed (user clicked a tab or category in the UI)
      let targetPath = '/';
      if (activeTab === 'shop') {
        targetPath = activeCategory === 'home' ? '/' : '/products';
      } else {
        targetPath = '/' + activeTab;
      }

      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }

      lastPathRef.current = targetPath;
      lastStateRef.current = { tab: activeTab, category: activeCategory };
    }
  }, [location.pathname, activeTab, activeCategory, navigate]);

  // Redirect guest users away from orders and require login
  React.useEffect(() => {
    if ((activeTab === 'orders' || activeTab === 'cart') && !user) {
      setLoginMessage('Please sign in to view your cart and orders.');
      setActiveTab('login');
    }
  }, [activeTab, user]);

  // Floating Zylix Lab Console Logs
  const [terminalOpen, setTerminalOpen] = React.useState(false);
  const [logs, setLogs] = React.useState([
    `[${new Date().toLocaleTimeString()}] System: Zylix Lab Console Online`,
    `[${new Date().toLocaleTimeString()}] Print Farm: 8/8 Active extruders connected`
  ]);

  React.useEffect(() => {
    const mockLogs = [
      "Job #4829: Printing carbon-fiber drone frame (45% complete...)",
      "Printer #3: Extruder temperature stabilized at 215°C",
      "Printer #7: Calibrating bed levelling matrix...",
      "Job #4830: Scanning broken mechanical spur gear (Validating stress specs...)",
      "System: Coolant flow rate at 94.2%",
      "Job #4831: Completed plants_stencil.dxf printing",
      "Slicer: Layer analysis complete for 'arcane_jinx_wallart.stl'",
      "Printer #5: PLA filament loaded (Matte Black)",
      "Job #4835: Custom miniature resin printing initialized"
    ];
    const interval = setInterval(() => {
      setLogs(prev => {
        const nextLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        const timestamp = new Date().toLocaleTimeString();
        // Keep last 5 logs for readability
        return [...prev.slice(-4), `[${timestamp}] ${nextLog}`];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global Add to Cart handler
  const handleAddToCart = (item, quantity = 1) => {
    if (!user) {
      setLoginMessage("Please sign in to add items to your cart.");
      setActiveTab("login");
      return;
    }
    setCartItems(prevItems => {
      if (item.isCustom) {
        return [...prevItems, { ...item, quantity }];
      }
      
      const existingItemIndex = prevItems.findIndex(i => !i.isCustom && i.id === item.id);
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }
      
      return [...prevItems, { ...item, quantity }];
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems(prevItems => prevItems.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCartItems(prevItems => {
      const updated = [...prevItems];
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: newQty };
      }
      return updated;
    });
  };

  // Toggle items in wishlist (favorites)
  const handleToggleWishlist = (product) => {
    if (!user) {
      setLoginMessage("Please sign in to add items to your wishlist.");
      setActiveTab("login");
      return;
    }
    setWishlist(prevWishlist => {
      const exists = prevWishlist.some(item => item.id === product.id);
      if (exists) {
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const handleRemoveFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  // User Actions
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('zylix_user', JSON.stringify(userData));
    setLoginMessage('');
    setWelcomeToast(`Welcome back, ${userData.name}!`);
    setCartLoaded(false); // Trigger refetch of cart items for the logged-in user
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zylix_user');
    setCartItems([]);
    setCartLoaded(true);
  };

  // Live cart count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
      backgroundColor: activeTab === 'login' ? '#ffffff' : '#fafafa',
      backgroundImage: activeTab === 'login' 
        ? 'linear-gradient(rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.82)), url("https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=1400")' 
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Decorative Grid Line System */}
      <div className="grid-bg" />

      {/* Navigation Header Segment */}
      {activeTab !== 'login' && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartCount}
          setCartOpen={setCartOpen}
          wishlistCount={wishlist.length}
          setWishlistOpen={setWishlistOpen}
          user={user}
          onLogout={handleLogout}
          studentApplied={studentApplied}
        />
      )}

      {/* Active Tab Main Content Area */}
      <main style={{ 
        flex: 1, 
        position: 'relative', 
        zIndex: 5, 
        padding: activeTab === 'login' ? '0' : '1rem 0',
        display: activeTab === 'login' ? 'flex' : 'block',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="tab-page-transition" key={activeTab}>
          {activeTab === 'shop' && (
            <ErrorBoundary>
              <ECommerceCatalog
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                activeTab={activeTab}
                onProductClick={setSelectedProduct}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                setActiveTab={setActiveTab}
                setActiveCategory={setActiveCategory}
              />
            </ErrorBoundary>
          )}
          {['ailab', 'designer'].includes(activeTab) && (
            <AIPrintLab
              onAddToCart={handleAddToCart}
              labTab={activeTab === 'ailab' ? 'slicer' : activeTab}
              setLabTab={(t) => {
                setActiveTab(t === 'slicer' ? 'ailab' : t);
              }}
              designerPreset={designerPreset}
              setDesignerPreset={setDesignerPreset}
              customizerText={customizerText}
              setCustomizerText={setCustomizerText}
              user={user}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'spareparts' && (
            <SpareParts
              onAddToCart={handleAddToCart}
              user={user}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'student' && (
            <StudentHub
              user={user}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'orders' && (
            <MyOrders
              user={user}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'login' && (
            <LoginView
              onLogin={handleLogin}
              setActiveTab={setActiveTab}
              loginMessage={loginMessage}
              setLoginMessage={setLoginMessage}
            />
          )}
          {['about','contact','privacy','terms','refund','shipping','faq'].includes(activeTab) && (
            <InfoPage page={activeTab} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'cart' && (
            <CartPage
              cartItems={cartItems}
              onRemoveItem={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
              onClearCart={handleClearCart}
              user={user}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
      </main>

      {/* Trust Badges Strip */}
      {activeTab !== 'login' && <TrustBadges />}

      {/* Footer Segment */}
      {activeTab !== 'login' && (
        <Footer setActiveTab={setActiveTab} setActiveCategory={setActiveCategory} />
      )}

      {/* Product Detail Modal Overlay */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onCustomize={handleCustomizeProduct}
        />
      )}

      {/* Shopping Cart Drawer Panel */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        setActiveTab={setActiveTab}
      />

      {/* Wishlist Drawer Overlay panel */}
      {wishlistOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setWishlistOpen(false)}>
          
          <div 
            className="glass-panel" 
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: 'default',
              animation: 'slideLeft 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#111', fontWeight: '800', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={18} fill="#000000" style={{ color: '#000000' }} /> Favorites Wishlist ({wishlist.length})
              </h2>
              <button onClick={() => setWishlistOpen(false)} style={{ background: 'transparent', border: 'none', color: '#000', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-secondary)' }}>
                  <p>Your wishlist is empty.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    Add items to your favorites while browsing the E-Store.
                  </p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'contain', border: '1px solid var(--border-color)', padding: '4px' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#111', fontWeight: '600' }}>{item.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>₹{item.price.toLocaleString('en-IN')}</span>
                        {item.originalPrice && <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{item.originalPrice.toLocaleString('en-IN')}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => {
                            handleAddToCart(item);
                            handleRemoveFromWishlist(item.id);
                          }}
                          className="btn-primary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '26px' }}
                        >
                          <ShoppingCart size={12} /> Add to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Zylix Lab Monitor Feed Widget */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        fontFamily: 'monospace',
        fontSize: '0.75rem'
      }}>
        {terminalOpen ? (
          <div style={{
            width: '340px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            color: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Terminal Header */}
            <div style={{ 
              padding: '8px 12px', 
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: 'rgba(15, 23, 42, 0.5)' 
            }}>
              <span style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                <span className="pulse-dot" style={{ backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)', width: '6px', height: '6px' }} /> 
                ZYLIX LIVE FEED
              </span>
              <button onClick={() => setTerminalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}>✕</button>
            </div>
            
            {/* Logs Container */}
            <div style={{ 
              padding: '12px', 
              height: '160px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              backgroundColor: 'rgba(10, 15, 30, 0.4)', 
              lineHeight: '1.4',
              scrollbarWidth: 'none'
            }}>
              {logs.map((log, idx) => {
                const isLatest = idx === logs.length - 1;
                return (
                  <div key={idx} style={{ 
                    color: isLatest ? '#fff' : 'rgba(255,255,255,0.5)', 
                    fontSize: '0.65rem',
                    borderLeft: isLatest ? '2px solid #ffffff' : '2px solid transparent',
                    paddingLeft: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    {log}
                  </div>
                );
              })}
            </div>
            
            {/* Terminal Footer */}
            <div style={{ 
              padding: '8px 12px', 
              borderTop: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: 'rgba(15, 23, 42, 0.6)' 
            }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)' }} />
                12 active jobs
              </span>
              <button
                onClick={() => { const ts = new Date().toLocaleTimeString(); setLogs(prev => [...prev.slice(-4), `[${ts}] Slicer: Queue optimized`]); }}
                style={{ 
                  background: '#ffffff', 
                  color: '#000000', 
                  border: 'none', 
                  padding: '3px 10px', 
                  borderRadius: '4px',
                  fontSize: '0.62rem', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
              >
                Optimise
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setTerminalOpen(true)}
            className="shimmer-sweep"
            style={{
              padding: '8px 16px', 
              backgroundColor: 'rgba(15, 23, 42, 0.85)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '20px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: '700', 
              letterSpacing: '0.08em', 
              fontFamily: 'monospace', 
              fontSize: '0.68rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            <span className="pulse-dot" style={{ backgroundColor: '#ffffff', boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)' }} />
            <span>ZYLIX LIVE FEED</span>
          </button>
        )}
      </div>

      {welcomeToast && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '20px',
          backgroundColor: '#000000',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.8rem',
          fontWeight: '700',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          letterSpacing: '0.02em',
          textTransform: 'uppercase'
        }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          {welcomeToast}
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
