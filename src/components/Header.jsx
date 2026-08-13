import React from 'react';
import { ShoppingCart, Search, Heart, LogIn, LogOut, ChevronDown, Menu, X, ChevronRight, ClipboardList } from 'lucide-react';
import { mockProducts as staticProducts } from '../data/products';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  activeCategory,
  setActiveCategory,
  searchQuery, 
  setSearchQuery,
  setSelectedProduct, 
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
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [searchProducts, setSearchProducts] = React.useState(staticProducts);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const searchRef = React.useRef(null);
  const mobileSearchRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) setSearchProducts(data);
      })
      .catch(err => console.error('Header products fetch error:', err));
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const inDesktop = searchRef.current && searchRef.current.contains(e.target);
      const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingProducts = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return searchProducts.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery, searchProducts]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when tab changes & lock body scroll
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab, activeCategory]);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    window.scrollTo(0, 0);
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
      backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.92)' : '#000000',
      backdropFilter: isScrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      boxShadow: isScrolled ? '0 10px 30px rgba(0, 0, 0, 0.45)' : '0 2px 8px rgba(0,0,0,0.1)',
      borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>

      {/* ── DESKTOP HEADER (unchanged) ── */}
      {!isMobile && (
        <>
          {/* Top Main Navigation Bar */}
          <div style={{
            borderBottom: '1px solid #1a1a1a',
            padding: '0 1.5rem',
            height: isScrolled ? '60px' : '68px',
            maxWidth: '95%',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr minmax(auto, 550px) 1fr',
            alignItems: 'center',
            gap: '1.5rem',
            position: 'relative',
            zIndex: 50,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Logo */}
            <div
              onClick={() => { setActiveTab('shop'); setActiveCategory('home'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <img src="/logo.png" alt="Zylix 3D Logo" style={{ height: isScrolled ? '56px' : '66px', width: 'auto', objectFit: 'contain', display: 'block', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>

            {/* Central Search Bar */}
            <div ref={searchRef} style={{ width: '100%', maxWidth: '550px', position: 'relative', justifySelf: 'center', zIndex: 100 }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (activeCategory === 'home') { setActiveCategory('all'); }
                  setActiveTab('shop');
                  window.scrollTo(0, 0);
                  setSearchFocused(false);
                }}
                style={{ display: 'flex', width: '100%' }}
              >
                <input
                  type="text"
                  placeholder="Search 3D keychains, masks, holders..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onClick={() => setSearchFocused(true)}
                  className="input-field"
                  style={{ paddingLeft: '1rem', paddingRight: '3rem', fontSize: '0.85rem', height: '36px', border: 'none', borderRadius: '0', flex: 1 }}
                />
                <button type="submit" style={{ background: '#ffffff', border: 'none', color: '#000000', width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '0' }}>
                  <Search size={18} />
                </button>
              </form>

              {/* Desktop Live Search Dropdown */}
              {searchFocused && (searchQuery || '').trim().length >= 1 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
                  border: '1px solid #cbd5e1',
                  zIndex: 99999,
                  overflow: 'hidden'
                }}>
                  {matchingProducts.length > 0 ? (
                    <>
                      <div style={{ padding: '0.5rem 0.85rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>MATCHING PRODUCTS ({matchingProducts.length})</span>
                        <button onClick={() => setSearchFocused(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', padding: '2px 6px' }}>✕</button>
                      </div>
                      <div style={{ maxHeight: '290px', overflowY: 'auto' }}>
                        {matchingProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => {
                              if (setSelectedProduct) setSelectedProduct(product);
                              setActiveTab('product-detail');
                              window.scrollTo(0, 0);
                              setSearchFocused(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '0.65rem 0.85rem',
                              borderBottom: '1px solid #f1f5f9',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {product.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ textTransform: 'capitalize', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600', color: '#475569' }}>
                                  {product.category || '3D Print'}
                                </span>
                                <span style={{ fontWeight: '800', color: '#090d16' }}>₹{product.price}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        onClick={() => {
                          if (activeCategory === 'home') { setActiveCategory('all'); }
                          setActiveTab('shop');
                          window.scrollTo(0, 0);
                          setSearchFocused(false);
                        }}
                        style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          letterSpacing: '0.02em'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                      >
                        View all results for "{searchQuery}" →
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                      No 3D products found matching "<strong>{searchQuery}</strong>"
                    </div>
                  )}
                </div>
              )}
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
          <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5', position: 'relative', zIndex: 1 }}>
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
          <div ref={mobileSearchRef} style={{ backgroundColor: '#111', padding: '0.5rem 1rem', borderBottom: '1px solid #222', position: 'relative' }}>
            <form onSubmit={(e) => { e.preventDefault(); if (activeCategory === 'home') { setActiveCategory('all'); } setActiveTab('shop'); window.scrollTo(0, 0); setSearchFocused(false); setMobileMenuOpen(false); }} style={{ display: 'flex' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                className="input-field"
                style={{ flex: 1, paddingLeft: '0.75rem', fontSize: '0.82rem', height: '36px', border: 'none', borderRadius: '0' }}
              />
              <button type="submit" style={{ background: '#fff', border: 'none', color: '#000', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Search size={16} />
              </button>
            </form>

            {/* Mobile Live Search Dropdown */}
            {searchFocused && (searchQuery || '').trim().length >= 1 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0.5rem',
                right: '0.5rem',
                marginTop: '2px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
                border: '1px solid #cbd5e1',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                {matchingProducts.length > 0 ? (
                  <>
                    <div style={{ padding: '0.4rem 0.75rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.68rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Matching Products ({matchingProducts.length})</span>
                      <button onClick={() => setSearchFocused(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', fontSize: '0.7rem' }}>✕</button>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {matchingProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => {
                            if (setSelectedProduct) setSelectedProduct(product);
                            setActiveTab('product-detail');
                            window.scrollTo(0, 0);
                            setSearchFocused(false);
                            setMobileMenuOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '0.6rem 0.75rem',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer'
                          }}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.80rem', fontWeight: '700', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ textTransform: 'capitalize', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>
                                {product.category || '3D Print'}
                              </span>
                              <span style={{ fontWeight: '800', color: '#090d16' }}>₹{product.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      onClick={() => {
                        if (activeCategory === 'home') { setActiveCategory('all'); }
                        setActiveTab('shop');
                        window.scrollTo(0, 0);
                        setSearchFocused(false);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        padding: '0.65rem',
                        textAlign: 'center',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      View all results for "{searchQuery}" →
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                    No products found for "<strong>{searchQuery}</strong>"
                  </div>
                )}
              </div>
            )}
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
