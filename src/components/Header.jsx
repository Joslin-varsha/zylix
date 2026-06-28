import React from 'react';
import { ShoppingCart, Search, Heart, LogIn, LogOut, ChevronDown, Menu, X, ChevronRight, ClipboardList } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  activeCategory,
  setActiveCategory,
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  setCartOpen,
  wishlistCount,
  setWishlistOpen,
  user,
  onLogout
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = React.useState(false);
  const [helpDropdownOpen, setHelpDropdownOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileShopOpen, setMobileShopOpen] = React.useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when tab changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab, activeCategory]);

  const helpPages = [
    { label: 'About Us', tab: 'about' },
    { label: 'Help & FAQ', tab: 'faq' },
    { label: 'Contact Us', tab: 'contact' },
    { label: 'Refund & Returns', tab: 'refund' },
    { label: 'Shipping Policy', tab: 'shipping' },
    { label: 'Privacy Policy', tab: 'privacy' },
    { label: 'Terms & Conditions', tab: 'terms' }
  ];

  const navigateTo = (tab, category) => {
    setActiveTab(tab);
    if (category) setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const [shopCategories, setShopCategories] = React.useState([
    { id: 'all', label: 'All Products' },
    { id: 'keychains', label: 'Custom Keychains' },
    { id: 'miniatures', label: 'Custom Miniature' },
    { id: 'holders', label: '3D Printed Holders' },
    { id: 'lightbox', label: 'Light Box' },
    { id: 'masks', label: '3D Mask' },
    { id: 'stencils', label: 'Stencil' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'wallart', label: 'Wall Art' }
  ]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const mapped = [
              { id: 'all', label: 'All Products' },
              ...data.map(c => ({ id: c.id, label: c.label }))
            ];
            setShopCategories(mapped);
          }
        }
      } catch (err) {
        console.error('Header categories fetch failed:', err);
      }
    };
    fetchCategories();
  }, []);

  // Sub-navigation bar categories compressed into a dropdown
  const subNavItems = [
    { id: 'home', label: 'Home', tab: 'shop', category: 'home' },
    { id: 'shop', label: 'Products', tab: 'shop', category: 'all', hasDropdown: true },
    { id: 'ailab', label: 'Upload File to Print', tab: 'ailab', category: null },
    { id: 'designer', label: 'Design Your Own', tab: 'designer', category: null },
    { id: 'spareparts', label: 'Spare Parts', tab: 'spareparts', category: null },
    { id: 'student', label: 'Prototype Lab', tab: 'student', category: null },
    { id: 'help', label: 'Help', tab: null, category: null, hasHelpDropdown: true },
  ];

  const handleSubNavClick = (item) => {
    navigateTo(item.tab, item.category);
  };

  return (
    <header style={{
      backgroundColor: '#000000',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>

      {/* ── DESKTOP HEADER (unchanged) ── */}
      {!isMobile && (
        <>
          {/* Top Main Navigation Bar */}
          <div style={{
            borderBottom: '1px solid #1a1a1a',
            padding: '0 1.5rem',
            height: '68px',
            maxWidth: '95%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr minmax(auto, 550px) 1fr',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            {/* Logo */}
            <div
              onClick={() => { setActiveTab('shop'); setActiveCategory('home'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <img src="/logo.png" alt="Zylix 3D Logo" style={{ height: '66px', width: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>

            {/* Central Search Bar */}
            <div style={{ width: '100%', maxWidth: '550px', position: 'relative', justifySelf: 'center' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); if (activeCategory === 'home') { setActiveCategory('all'); setActiveTab('shop'); } }}
                style={{ display: 'flex', width: '100%' }}
              >
                <input
                  type="text"
                  placeholder="Search 3D printers, filaments, casings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '1rem', paddingRight: '3rem', fontSize: '0.85rem', height: '36px', border: 'none', borderRadius: '0', flex: 1 }}
                />
                <button type="submit" style={{ background: '#ffffff', border: 'none', color: '#000000', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '0' }}>
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifySelf: 'end' }}>
              {user ? (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Hi, {user.name}</span><ChevronDown size={14} />
                  </button>
                  {profileDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '150px', overflow: 'hidden', zIndex: 110 }}>
                      {user && (user.email === 'admin@zylix.com' || user.name.toLowerCase() === 'admin') && (
                        <button onClick={() => { navigateTo('admin'); setProfileDropdownOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.75rem 1rem', width: '100%', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #eee' }}>
                          ⚙️ Admin Portal
                        </button>
                      )}
                      <button onClick={() => { if (window.confirm("Are you sure you want to log out?")) { onLogout(); setProfileDropdownOpen(false); } }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.75rem 1rem', width: '100%', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setActiveTab('login')} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LogIn size={16} /> Sign In
                </button>
              )}
              <button onClick={() => setWishlistOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }} title="Wishlist">
                <Heart size={20} />
                {wishlistCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--accent-color)', color: '#ffffff', width: '16px', height: '16px', borderRadius: '50%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{wishlistCount}</span>}
              </button>
              <button onClick={() => navigateTo('orders')} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} title="My Orders">
                <ClipboardList size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>My Orders</span>
              </button>
              <button onClick={() => setCartOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingCart size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Cart</span>
                {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-color)', color: '#ffffff', width: '18px', height: '18px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* Sub-Navigation Bar */}
          <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ maxWidth: '95%', margin: '0 auto', padding: '0.5rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
              {subNavItems.map((item) => {
                const isSelected = item.id === 'home'
                  ? (activeTab === 'shop' && activeCategory === 'home')
                  : item.id === 'shop'
                    ? (activeTab === 'shop' && activeCategory !== 'home')
                    : activeTab === item.tab;

                if (item.hasDropdown) {
                  return (
                    <div key={item.id} onMouseEnter={() => setShopDropdownOpen(true)} onMouseLeave={() => setShopDropdownOpen(false)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button onClick={() => { navigateTo(item.tab, 'all'); setShopDropdownOpen(false); }} className={`sub-nav-btn ${isSelected ? 'active' : ''}`} style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: isSelected ? '700' : '500' }}>
                        {item.label} <ChevronDown size={12} />
                      </button>
                      {shopDropdownOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', zIndex: 250, minWidth: '220px', display: 'flex', flexDirection: 'column', padding: '0.5rem 0', animation: 'fadeIn 0.15s ease-out' }}>
                          {shopCategories.map((cat) => (
                            <button key={cat.id} onClick={() => { setActiveTab('shop'); setActiveCategory(cat.id); setShopDropdownOpen(false); }} style={{ background: 'transparent', border: 'none', padding: '0.65rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', color: activeCategory === cat.id ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: activeCategory === cat.id ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#fafafa'; e.target.style.color = 'var(--accent-color)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = activeCategory === cat.id ? 'var(--accent-color)' : 'var(--text-secondary)'; }}>
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.hasHelpDropdown) {
                  const isHelpActive = ['about','faq','contact','refund','shipping','privacy','terms'].includes(activeTab);
                  return (
                    <div key={item.id} onMouseEnter={() => setHelpDropdownOpen(true)} onMouseLeave={() => setHelpDropdownOpen(false)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button className={`sub-nav-btn ${isHelpActive ? 'active' : ''}`} style={{ color: isHelpActive ? 'var(--accent-color)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: isHelpActive ? '700' : '500' }}>
                        {item.label} <ChevronDown size={12} />
                      </button>
                      {helpDropdownOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, backgroundColor: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', zIndex: 250, minWidth: '200px', display: 'flex', flexDirection: 'column', padding: '0.5rem 0', animation: 'fadeIn 0.15s ease-out' }}>
                          {helpPages.map((page) => (
                            <button key={page.tab} onClick={() => { navigateTo(page.tab); setHelpDropdownOpen(false); }} style={{ background: 'transparent', border: 'none', padding: '0.65rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', color: activeTab === page.tab ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: activeTab === page.tab ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s ease' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#fafafa'; e.target.style.color = 'var(--accent-color)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = activeTab === page.tab ? 'var(--accent-color)' : 'var(--text-secondary)'; }}>
                              {page.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button key={item.id} onClick={() => handleSubNavClick(item)} className={`sub-nav-btn ${isSelected ? 'active' : ''}`} style={{ color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: isSelected ? '700' : '500' }}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE HEADER ── */}
      {isMobile && (
        <>
          {/* Mobile Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '56px', borderBottom: '1px solid #1a1a1a' }}>
            {/* Hamburger */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <div onClick={() => { setActiveTab('shop'); setActiveCategory('home'); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="Zylix 3D" style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block' }} />
            </div>

            {/* Right icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setWishlistOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'flex' }}>
                <Heart size={20} />
                {wishlistCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-7px', background: 'var(--accent-color)', color: '#fff', width: '15px', height: '15px', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{wishlistCount}</span>}
              </button>
              <button onClick={() => setCartOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative', display: 'flex' }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span style={{ position: 'absolute', top: '-7px', right: '-7px', background: 'var(--accent-color)', color: '#fff', width: '16px', height: '16px', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div style={{ backgroundColor: '#111', padding: '0.5rem 1rem', borderBottom: '1px solid #222' }}>
            <form onSubmit={(e) => { e.preventDefault(); if (activeCategory === 'home') { setActiveCategory('all'); setActiveTab('shop'); } setMobileMenuOpen(false); }} style={{ display: 'flex' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ flex: 1, paddingLeft: '0.75rem', fontSize: '0.82rem', height: '34px', border: 'none', borderRadius: '0' }}
              />
              <button type="submit" style={{ background: '#fff', border: 'none', color: '#000', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Mobile Slide-down Menu */}
          {mobileMenuOpen && (
            <div style={{
              position: 'fixed',
              top: '108px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#fff',
              borderBottom: '2px solid #000',
              overflowY: 'auto',
              zIndex: 999
            }}>

              {/* Sign In / User */}
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {user ? (
                  <>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#000' }}>Hi, {user.name}</span>
                    <button onClick={() => { if (window.confirm("Log out?")) { onLogout(); setMobileMenuOpen(false); } }} style={{ background: 'transparent', border: '1px solid #ccc', color: '#555', fontSize: '0.75rem', padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <LogOut size={13} /> Log Out
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }} style={{ background: '#000', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: '700', padding: '0.5rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' }}>
                    <LogIn size={16} /> Sign In
                  </button>
                )}
              </div>

              {/* Home */}
              <button onClick={() => navigateTo('shop', 'home')} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #f0f0f0', padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.88rem', fontWeight: activeTab === 'shop' && activeCategory === 'home' ? '700' : '500', color: activeTab === 'shop' && activeCategory === 'home' ? 'var(--accent-color)' : '#000', cursor: 'pointer' }}>
                🏠 Home
              </button>

              {/* Products accordion */}
              <div style={{ borderBottom: '1px solid #f0f0f0' }}>
                <button onClick={() => setMobileShopOpen(!mobileShopOpen)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.88rem', fontWeight: '500', color: '#000', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  🛍️ Products
                  {mobileShopOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {mobileShopOpen && (
                  <div style={{ backgroundColor: '#fafafa', paddingLeft: '1rem' }}>
                    {shopCategories.map(cat => (
                      <button key={cat.id} onClick={() => navigateTo('shop', cat.id)} style={{ width: '100%', background: 'transparent', border: 'none', borderTop: '1px solid #efefef', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.82rem', color: activeCategory === cat.id ? 'var(--accent-color)' : '#444', fontWeight: activeCategory === cat.id ? '700' : '400', cursor: 'pointer' }}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Services */}
              {[
                { label: '🖨️ Upload File to Print', tab: 'ailab' },
                { label: '🎨 Design Your Own', tab: 'designer' },
                { label: '🔧 Spare Parts', tab: 'spareparts' },
                { label: '🔬 Prototype Lab', tab: 'student' },
                { label: '📋 My Orders', tab: 'orders' },
              ].map(item => (
                <button key={item.tab} onClick={() => navigateTo(item.tab)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #f0f0f0', padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.88rem', fontWeight: activeTab === item.tab ? '700' : '500', color: activeTab === item.tab ? 'var(--accent-color)' : '#000', cursor: 'pointer' }}>
                  {item.label}
                </button>
              ))}

              {/* Help accordion */}
              <div style={{ borderBottom: '1px solid #f0f0f0' }}>
                <button onClick={() => setMobileHelpOpen(!mobileHelpOpen)} style={{ width: '100%', background: 'transparent', border: 'none', padding: '0.9rem 1.25rem', textAlign: 'left', fontSize: '0.88rem', fontWeight: '500', color: '#000', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  ℹ️ Help & Info
                  {mobileHelpOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {mobileHelpOpen && (
                  <div style={{ backgroundColor: '#fafafa', paddingLeft: '1rem' }}>
                    {helpPages.map(page => (
                      <button key={page.tab} onClick={() => navigateTo(page.tab)} style={{ width: '100%', background: 'transparent', border: 'none', borderTop: '1px solid #efefef', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.82rem', color: activeTab === page.tab ? 'var(--accent-color)' : '#444', fontWeight: activeTab === page.tab ? '700' : '400', cursor: 'pointer' }}>
                        {page.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}

    </header>
  );
}
