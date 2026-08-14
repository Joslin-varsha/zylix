import React from 'react';
import { 
  Star, ShoppingCart, Heart, ChevronLeft, ChevronRight, 
  Package, Award, SlidersHorizontal, Key, Gift, Image, 
  PenTool, Lightbulb, Smile, Sparkles, Box, Filter, Zap, 
  ArrowRight, TrendingUp, Wrench, Shield, Compass, Palette, X
} from 'lucide-react';
import { mockProducts as staticProducts } from '../data/products';

const staticCategories = [
  { id: 'keychains', label: 'Custom Keychains', icon: 'Key', img: '/images/categories/keychains.webp' },
  { id: 'miniatures', label: 'Custom Miniature', icon: 'Sparkles', img: '/images/categories/miniatures.jpg' },
  { id: 'holders', label: '3D Printed Holders', icon: 'Box', img: '/images/categories/holders.jpg' },
  { id: 'lightbox', label: 'Light Box', icon: 'Lightbulb', img: '/images/categories/lightbox.jpg' },
  { id: 'masks', label: '3D Mask', icon: 'Smile', img: '/images/categories/masks.jpg' },
  { id: 'stencils', label: 'Stencil', icon: 'PenTool', img: '/images/categories/stencils.jpg' },
  { id: 'gifts', label: 'Gifts', icon: 'Gift', img: '/images/categories/gifts.jpg' },
  { id: 'wallart', label: 'Wall Art', icon: 'Image', img: '/images/categories/wallart.jpg' }
];

const iconMap = {
  Key, Gift, Image, PenTool, Lightbulb, Smile, Sparkles, Box,
  Package, Award, Zap, TrendingUp, Star, ShoppingCart, Heart, Filter,
  Wrench, Shield, Compass, Palette
};

const renderCategoryIcon = (iconName, size = 22) => {
  const IconComponent = iconMap[iconName] || Package;
  return <IconComponent size={size} />;
};

const carouselSlides = [
  {
    title: "Custom Keychains",
    subtitle: "Personalized · Name · Couple · NFC",
    description: "Fully custom 3D printed keychains — your name, your design. NFC-enabled, couple sets & bulk orders available.",
    btnText: "Shop Keychains",
    category: "keychains",
    image: "/images/carousel/slide-1.avif",
    tag: "BESTSELLER"
  },
  {
    title: "Upload File to Print",
    subtitle: "Upload CAD · Get Custom Quote",
    description: "Upload your CAD file (STL, OBJ, 3MF) and select custom requirements. Our engineers will email your detailed quote ticket within 2 hours.",
    btnText: "Get Custom Quote",
    category: "all",
    image: "/images/carousel/slide-2.jpg",
    tag: "NEW"
  },
  {
    title: "3D Printed Masks",
    subtitle: "Cosplay · Festival · Wearable Art",
    description: "Iron Man, Cyberpunk Oni & more — wearable full-scale masks with adjustable straps and optional LED lighting.",
    btnText: "Shop Masks",
    category: "masks",
    image: "/images/carousel/slide-3.webp",
    tag: "TRENDING"
  },
  {
    title: "Glowing Light Boxes",
    subtitle: "LED · Layered · Ambient Decor",
    description: "Custom name & geometric light boxes with depth-illusion LED glow. Perfect as room decor or a unique gift.",
    btnText: "Shop Light Boxes",
    category: "lightbox",
    image: "/images/carousel/slide-4.jpg",
    tag: "PREMIUM"
  }
];

const marqueeItems = [
  "CUSTOM KEYCHAINS", "CUSTOM MINIATURE", "3D PRINTED HOLDERS", "LIGHT BOX",
  "3D MASK", "STENCIL", "GIFTS", "WALL ART", "FREE SHIPPING OVER ₹200",
  "CUSTOM KEYCHAINS", "CUSTOM MINIATURE", "3D PRINTED HOLDERS", "LIGHT BOX",
  "3D MASK", "STENCIL", "GIFTS", "WALL ART", "FREE SHIPPING OVER ₹200"
];

export default function ECommerceCatalog({ 
  searchQuery, 
  activeCategory,
  onProductClick, 
  onAddToCart, 
  onBuyNow,
  wishlist,
  onToggleWishlist,
  setActiveTab,
  setActiveCategory
}) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const [products, setProducts] = React.useState([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [categories, setCategories] = React.useState(staticCategories);

  React.useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (isMounted) {
          setProducts(data);
          setLoadingProducts(false);
        }
      } catch (err) {
        console.error('[Catalog Fetch Error]:', err);
        if (isMounted) {
          setProducts(staticProducts);
          setLoadingProducts(false);
        }
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, [API_BASE]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        if (isMounted && data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('[Categories Fetch Error]:', err);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, [API_BASE]);

  const [carouselIndex, setCarouselIndex] = React.useState(0);
  const [animatingSlide, setAnimatingSlide] = React.useState(false);
  const [selectedCats, setSelectedCats] = React.useState([]);
  const [priceRange, setPriceRange] = React.useState(1500);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [hoveredCategory, setHoveredCategory] = React.useState(null);
  const [sortBy, setSortBy] = React.useState('best');
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);



  const handleDragScroll = (e, ref) => {
    const container = ref.current;
    if (!container) return;
    let startX = e.pageX - container.offsetLeft;
    let scrollLeft = container.scrollLeft;

    const onMouseMove = (me) => {
      const x = me.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      container.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  const newRef = React.useRef(null);
  const featuredRef = React.useRef(null);
  const moreRef = React.useRef(null);
  const categoriesRef = React.useRef(null);

  const maxProductPrice = React.useMemo(() => products.length > 0 ? Math.max(...products.map(p => p.price)) : 1500, [products]);

  React.useEffect(() => {
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.price));
      setPriceRange(maxPrice);
    }
  }, [products]);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const cardWidth = 270; // 250px width + 20px (1.25rem) gap
      ref.current.scrollBy({
        left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
        behavior: 'smooth'
      });
    }
  };

  const viewMode = activeCategory === 'home' ? 'home' : 'catalog';

  React.useEffect(() => {
    if (activeCategory !== 'home' && activeCategory !== 'all') {
      setSelectedCats([activeCategory]);
    } else if (activeCategory === 'all') {
      setSelectedCats([]);
    }
  }, [activeCategory]);

  // Auto-play slider
  React.useEffect(() => {
    if (viewMode !== 'home') return;
    const interval = setInterval(() => {
      setAnimatingSlide(true);
      setTimeout(() => {
        setCarouselIndex(prev => (prev + 1) % carouselSlides.length);
        setAnimatingSlide(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [viewMode]);

  const goToSlide = (index) => {
    setAnimatingSlide(true);
    setTimeout(() => { setCarouselIndex(index); setAnimatingSlide(false); }, 300);
  };

  const handleNextSlide = () => goToSlide((carouselIndex + 1) % carouselSlides.length);
  const handlePrevSlide = () => goToSlide((carouselIndex - 1 + carouselSlides.length) % carouselSlides.length);

  const handleCatCheckbox = (catId) => {
    setSelectedCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setPriceRange(maxProductPrice);
    setInStockOnly(false);
    setActiveCategory('all');
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCats.length === 0 || selectedCats.includes(product.category);
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price <= priceRange;
    const matchesStock = !inStockOnly || product.inStock;
    return matchesCategory && matchesSearch && matchesPrice && matchesStock;
  });

  const sortedProducts = React.useMemo(() => {
    const productsCopy = [...filteredProducts];
    if (sortBy === 'price-asc') {
      return productsCopy.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      return productsCopy.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      return productsCopy.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name-asc') {
      return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return productsCopy; // 'best'
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCats, priceRange, inStockOnly, searchQuery]);

  // IntersectionObserver effect for smooth scroll reveal animations
  React.useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    const elements = document.querySelectorAll('.scroll-reveal, .reveal-fade, .reveal-scale');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [products, activeCategory, currentPage, viewMode]);

  const slide = carouselSlides[carouselIndex];

  return (
    <div className="main-catalog-container" style={{ maxWidth: '95%', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
      {viewMode === 'home' ? (
        <div>
          {/* ===== MARQUEE TICKER ===== */}
          <div className="marquee-wrapper reveal-fade">
            <div className="marquee-track">
              {marqueeItems.map((item, i) => (
                <span key={i} className="marquee-item">
                  <span className="marquee-dot">◆</span> {item}
                </span>
              ))}
            </div>
          </div>

          {/* ===== HERO CAROUSEL ===== */}
          <div className="hero-carousel-container scroll-reveal" style={{ position: 'relative', height: isMobile ? '230px' : '420px', overflow: 'hidden', marginBottom: '0', borderRadius: '16px 16px 0 0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'height 0.3s ease' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              filter: 'brightness(82%) contrast(105%)',
              transition: 'opacity 0.6s ease',
              opacity: animatingSlide ? 0 : 1
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.15) 60%, transparent 100%)',
              zIndex: 2
            }} />
            <div className="hero-corner hero-corner-tl" style={{ borderRadius: '16px 0 0 0' }} />
            <div className="hero-corner hero-corner-br" style={{ borderRadius: '0 0 16px 0' }} />

            {/* Content wrapped in a floating frosted glass panel */}
            <div className="hero-glass-panel" style={{
              position: 'absolute',
              top: isMobile ? 'auto' : '50%',
              bottom: isMobile ? '12px' : 'auto',
              left: isMobile ? '12px' : '3rem',
              right: isMobile ? '12px' : 'auto',
              transform: isMobile ? 'none' : (animatingSlide ? 'translateY(-46%)' : 'translateY(-50%)'),
              opacity: animatingSlide ? 0 : 1,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 5,
              padding: isMobile ? '0.75rem 1rem' : '1.25rem 1.5rem',
              maxWidth: isMobile ? 'none' : '440px',
              backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.45)' : 'rgba(10, 15, 30, 0.72)',
              backdropFilter: isMobile ? 'none' : 'blur(16px)',
              WebkitBackdropFilter: isMobile ? 'none' : 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.35rem' : '0.6rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff', fontSize: '0.55rem', fontWeight: '800', padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {slide.tag}
                </span>
                <span style={{ color: '#cbd5e1', fontSize: isMobile ? '0.65rem' : '0.72rem', letterSpacing: '0.05em', fontWeight: '500' }}>
                  {slide.subtitle}
                </span>
              </div>
              <h2 style={{ fontSize: isMobile ? '1.15rem' : 'clamp(1.3rem, 3vw, 2rem)', fontWeight: '800', color: '#ffffff', lineHeight: '1.15', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', margin: 0 }}>
                {slide.title}
              </h2>
              {!isMobile && (
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.55', maxWidth: '380px', margin: 0 }}>
                  {slide.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveCategory(slide.category)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: isMobile ? '0.72rem' : '0.78rem', padding: isMobile ? '0.35rem 0.8rem' : '0.45rem 1rem' }}
                >
                  {slide.btnText} <ArrowRight size={13} />
                </button>
                <button 
                  onClick={() => setActiveCategory('all')} 
                  className="btn-secondary" 
                  style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.07)', fontSize: isMobile ? '0.72rem' : '0.78rem', padding: isMobile ? '0.35rem 0.8rem' : '0.45rem 1rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#ffffff'; }}
                >
                  View All
                </button>
              </div>
            </div>

            {/* Slide dots */}
            <div className="hero-slide-dots" style={{ position: 'absolute', bottom: isMobile ? '16px' : '24px', right: isMobile ? '16px' : 'auto', left: isMobile ? 'auto' : '4rem', display: 'flex', gap: '6px', zIndex: 10 }}>
              {carouselSlides.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} style={{ width: i === carouselIndex ? (isMobile ? '20px' : '28px') : '6px', height: '6px', borderRadius: '3px', backgroundColor: i === carouselIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
              ))}
            </div>

            {!isMobile && (
              <>
                <button onClick={handlePrevSlide} className="carousel-arrow" style={{ left: '1.5rem', borderRadius: '50%' }}><ChevronLeft size={20} /></button>
                <button onClick={handleNextSlide} className="carousel-arrow" style={{ right: '1.5rem', borderRadius: '50%' }}><ChevronRight size={20} /></button>
              </>
            )}

            <div style={{ position: 'absolute', bottom: '24px', right: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: '600', zIndex: 10 }}>
              {String(carouselIndex + 1).padStart(2, '0')} / {String(carouselSlides.length).padStart(2, '0')}
            </div>
            {/* Bottom Curve Wave */}
            <div className="hero-wave-divider" style={{
              position: 'absolute',
              bottom: -1,
              left: 0,
              right: 0,
              zIndex: 20,
              lineHeight: 0,
              overflow: 'hidden'
            }}>
              <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
                <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" fill="#f8fafc" />
              </svg>
            </div>
          </div>

          {/* ===== CATEGORY CARDS ===== */}
          <div className="category-cards-section scroll-reveal" style={{ marginBottom: isMobile ? '2rem' : '3.5rem', backgroundColor: '#f8fafc', padding: isMobile ? '1.25rem 0 1rem' : '2rem 0 0', marginTop: '-2px' }}>
            <div className="shelf-header" style={{ marginBottom: isMobile ? '1.0rem' : '1.5rem', padding: isMobile ? '0 0.25rem' : '0' }}>
              <div>
                <h2 className="shelf-title" style={{ fontSize: isMobile ? '1.15rem' : '1.5rem', fontWeight: '900' }}>Shop by Category</h2>
              </div>
              <button onClick={() => setActiveCategory('all')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.opacity = 0.8} onMouseLeave={(e) => e.target.style.opacity = 1}>
                VIEW ALL <ArrowRight size={12} />
              </button>
            </div>

            {isMobile ? (
              /* 2-ROW HORIZONTAL SWIPER STRIP FOR MOBILE */
              <div 
                className="category-mobile-swiper" 
                style={{
                  display: 'grid',
                  gridTemplateRows: 'repeat(2, 78px)',
                  gridAutoFlow: 'column',
                  gridAutoColumns: 'calc(48% - 0.25rem)',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  padding: '0.25rem 0.25rem 0.65rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      position: 'relative',
                      height: '78px',
                      width: '100%',
                      scrollSnapAlign: 'start',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#0f172a',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      padding: 0,
                      boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'transform 0.15s ease'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {/* Background image */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${cat.img})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      filter: 'brightness(65%)'
                    }} />
                    {/* Dark Gradient Overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.45) 100%)'
                    }} />
                    {/* Icon + Label */}
                    <div style={{
                      position: 'relative', zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 0.65rem',
                      color: '#ffffff',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.25)'
                      }}>
                        {renderCategoryIcon(cat.icon, 16)}
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'capitalize',
                        lineHeight: '1.2',
                        color: '#ffffff',
                        letterSpacing: '0.01em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {cat.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* DESKTOP CATEGORY CARDS */
              <div className="carousel-wrapper" style={{ position: 'relative' }}>
                <div ref={categoriesRef} onWheel={(e) => { if (categoriesRef.current && e.deltaY) { categoriesRef.current.scrollLeft += e.deltaY; } }} className="category-scroll-grid">
                  {categories.map((cat, i) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        position: 'relative',
                        height: '110px',
                        width: '140px',
                        flexShrink: 0,
                        border: hoveredCategory === cat.id ? '2px solid var(--accent-color)' : '2px solid transparent',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'none',
                        padding: 0,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: hoveredCategory === cat.id ? 'translateY(-4px)' : 'translateY(0)',
                        boxShadow: hoveredCategory === cat.id ? '0 12px 24px var(--accent-glow)' : '0 4px 12px rgba(0, 0, 0, 0.02)',
                        animationDelay: `${i * 0.06}s`,
                        animation: 'fadeInUp 0.5s ease-out both'
                      }}
                    >
                      {/* Background image */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `url(${cat.img})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'transform 0.4s ease',
                        transform: hoveredCategory === cat.id ? 'scale(1.08)' : 'scale(1)'
                      }} />
                      {/* Dark overlay */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: hoveredCategory === cat.id
                          ? 'rgba(15, 23, 42, 0.65)'
                          : 'rgba(15, 23, 42, 0.45)',
                        transition: 'background 0.3s ease'
                      }} />
                      {/* Label */}
                      <div style={{
                        position: 'relative', zIndex: 2,
                        height: '100%',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                        color: '#fff'
                      }}>
                        <span style={{ 
                          opacity: 0.9,
                          transform: hoveredCategory === cat.id ? 'translateY(-2px)' : 'translateY(0)',
                          transition: 'transform 0.3s ease',
                          color: hoveredCategory === cat.id ? 'var(--accent-color)' : '#fff'
                        }}>{renderCategoryIcon(cat.icon)}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', lineHeight: '1.2', padding: '0 8px' }}>
                          {cat.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* ===== NEW PRODUCTS SHELF ===== */}
          <div className="scroll-reveal reveal-delay-1" style={{ marginBottom: '3.5rem' }}>
            <div className="shelf-header">
              <div>
                <h2 className="shelf-title">We Are Introducing Our New Products</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Fresh prints, exclusive designs — crafted just for you</p>
              </div>
              <button onClick={() => setActiveCategory('all')} className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Let's Shop <ArrowRight size={12} />
              </button>
            </div>
            <div className="carousel-wrapper" style={{ position: 'relative' }}>
              <button onClick={() => scroll(newRef, 'left')} className="carousel-nav-btn" style={{ left: '-20px' }} aria-label="Scroll left"><ChevronLeft size={20} /></button>
              <button onClick={() => scroll(newRef, 'right')} className="carousel-nav-btn" style={{ right: '-20px' }} aria-label="Scroll right"><ChevronRight size={20} /></button>
              <div ref={newRef} className="products-scroll-container">
                {products.filter(p => ['keychains', 'miniatures', 'holders', 'lightbox'].includes(p.category)).map((product, i) => {
                  const isWishlisted = wishlist.some(item => item.id === product.id);
                  return <ProductCard key={product.id} product={product} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} onBuyNow={onBuyNow} setActiveTab={setActiveTab} animDelay={i * 0.1} />;
                })}
              </div>
            </div>
          </div>

          {/* ===== FEATURED SHELF ===== */}
          <div className="scroll-reveal reveal-delay-1" style={{ marginBottom: '3.5rem', marginTop: '3.5rem' }}>
            <div className="shelf-header">
              <div>
                <h2 className="shelf-title">Featured Custom Prints & Signages</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Handpicked bestsellers from our collection</p>
              </div>
              <button onClick={() => setActiveCategory('all')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'var(--transition-fast)' }} onMouseEnter={(e) => e.target.style.opacity = 0.8} onMouseLeave={(e) => e.target.style.opacity = 1}>
                VIEW ALL <ArrowRight size={12} />
              </button>
            </div>
            <div className="carousel-wrapper" style={{ position: 'relative' }}>
              <button onClick={() => scroll(featuredRef, 'left')} className="carousel-nav-btn" style={{ left: '-20px' }} aria-label="Scroll left"><ChevronLeft size={20} /></button>
              <button onClick={() => scroll(featuredRef, 'right')} className="carousel-nav-btn" style={{ right: '-20px' }} aria-label="Scroll right"><ChevronRight size={20} /></button>
              <div ref={featuredRef} className="products-scroll-container">
                {products.filter(p => ['masks', 'stencils', 'gifts', 'wallart'].includes(p.category)).map((product, i) => {
                  const isWishlisted = wishlist.some(item => item.id === product.id);
                  return <ProductCard key={product.id} product={product} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} onBuyNow={onBuyNow} setActiveTab={setActiveTab} animDelay={i * 0.1} />;
                })}
              </div>
            </div>
          </div>

          {/* ===== MORE PRODUCTS ===== */}
          <div className="scroll-reveal reveal-delay-2">
            <div className="shelf-header">
              <div>
                <h2 className="shelf-title">More From Our Collection</h2>
              </div>
            </div>
            <div className="carousel-wrapper" style={{ position: 'relative' }}>
              <button onClick={() => scroll(moreRef, 'left')} className="carousel-nav-btn" style={{ left: '-20px' }} aria-label="Scroll left"><ChevronLeft size={20} /></button>
              <button onClick={() => scroll(moreRef, 'right')} className="carousel-nav-btn" style={{ right: '-20px' }} aria-label="Scroll right"><ChevronRight size={20} /></button>
              <div ref={moreRef} className="products-scroll-container">
                {products.slice(1).filter((_, i) => i % 2 === 0).slice(0, 8).map((product, i) => {
                  const isWishlisted = wishlist.some(item => item.id === product.id);
                  return <ProductCard key={product.id} product={product} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} onBuyNow={onBuyNow} setActiveTab={setActiveTab} animDelay={i * 0.1} />;
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== CATALOG VIEW ===== */
        <div style={{ paddingTop: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 className="shelf-title" style={{ margin: 0 }}>
                {searchQuery ? `Results for "${searchQuery}"` : 'All Products Catalog'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Sort By Dropdown */}
            <div className="desktop-sort-by-container" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sort By:</span>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.3rem 1.6rem 0.3rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 6px center',
                  backgroundSize: '10px',
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#000000'}
                onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="best">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="mobile-filter-bar">
            <button className="mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
              <Filter size={14} /> Filter {selectedCats.length > 0 ? `(${selectedCats.length})` : ''}
            </button>
            <div className="mobile-filter-btn" style={{ position: 'relative' }}>
              <SlidersHorizontal size={14} /> 
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="best">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Sort</span>
            </div>
          </div>

          <div className={`mobile-filter-drawer-overlay ${mobileFiltersOpen ? 'active' : ''}`} onClick={() => setMobileFiltersOpen(false)}>
            <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-filter-drawer-header">
                <span style={{ fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                  <Filter size={14} /> Filters
                </span>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000000', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mobile-filter-drawer-content">
                {/* Categories checklist */}
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000', marginBottom: '0.75rem' }}>Categories</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {categories.map(cat => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer', color: selectedCats.includes(cat.id) ? '#000' : 'var(--text-secondary)', fontWeight: selectedCats.includes(cat.id) ? '600' : '400' }}>
                        <input type="checkbox" checked={selectedCats.includes(cat.id)} onChange={() => handleCatCheckbox(cat.id)} style={{ accentColor: '#000', cursor: 'pointer', scale: '1.1' }} />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Price slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000' }}>Max Price</h4>
                    <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>₹{priceRange.toLocaleString('en-IN')}</span>
                  </div>
                  <input type="range" min="15" max={maxProductPrice} step="10" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#000', cursor: 'pointer' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>₹15</span><span>₹{maxProductPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Stock status toggle */}
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000', marginBottom: '0.75rem' }}>Availability</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} style={{ accentColor: '#000', cursor: 'pointer', scale: '1.1' }} />
                    Exclude Out of Stock
                  </label>
                </div>
              </div>
              <div className="mobile-filter-drawer-footer">
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}
                >
                  APPLY FILTERS ({filteredProducts.length} PRODUCTS)
                </button>
                {(selectedCats.length > 0 || priceRange < maxProductPrice || inStockOnly) && (
                  <button 
                    onClick={() => { clearFilters(); setMobileFiltersOpen(false); }}
                    style={{ width: '100%', background: 'none', border: 'none', textDecoration: 'underline', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', marginTop: '0.6rem' }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="catalog-layout-container" style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', alignItems: 'start' }}>
            {/* SIDEBAR */}
            <div className="catalog-sidebar" style={{ width: '230px', flexShrink: 0, backgroundColor: '#ffffff', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'uppercase' }}>
                  <Filter size={13} /> Filters
                </span>
                {(selectedCats.length > 0 || priceRange < 1500 || inStockOnly) && (
                  <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', textDecoration: 'underline', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}>Clear All</button>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000', marginBottom: '0.75rem' }}>Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {categories.map(cat => (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: selectedCats.includes(cat.id) ? '#000' : 'var(--text-secondary)', fontWeight: selectedCats.includes(cat.id) ? '600' : '400' }}>
                      <input type="checkbox" checked={selectedCats.includes(cat.id)} onChange={() => handleCatCheckbox(cat.id)} style={{ accentColor: '#000', cursor: 'pointer' }} />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000' }}>Max Price</h4>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" min="15" max={maxProductPrice} step="10" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#000', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>₹15</span><span>₹{maxProductPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#000', marginBottom: '0.75rem' }}>Availability</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} style={{ accentColor: '#000', cursor: 'pointer' }} />
                  Exclude Out of Stock
                </label>
              </div>

              <button onClick={() => { setActiveCategory('home'); clearFilters(); }} className="btn-secondary" style={{ width: '100%', fontSize: '0.72rem', padding: '0.5rem', borderStyle: 'dashed' }}>
                ← Back to Home
              </button>
            </div>

            {/* GRID */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedCats.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {selectedCats.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <span key={catId} onClick={() => handleCatCheckbox(catId)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#000', color: '#fff', fontSize: '0.7rem', fontWeight: '600', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}>
                        {cat?.label} ×
                      </span>
                    );
                  })}
                </div>
              )}
              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                  <Filter size={30} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '0.95rem', color: '#000' }}>No products match selected filters</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Try expanding your price range or adjusting categories.</p>
                  <button onClick={clearFilters} className="btn-primary" style={{ marginTop: '1.25rem', fontSize: '0.78rem' }}>Reset All Filters</button>
                </div>
              ) : (
                <div>
                  <div className="products-grid">
                    {paginatedProducts.map((product, i) => {
                      const isWishlisted = wishlist.some(item => item.id === product.id);
                      return <ProductCard key={product.id} product={product} isWishlisted={isWishlisted} onToggleWishlist={onToggleWishlist} onProductClick={onProductClick} onAddToCart={onAddToCart} onBuyNow={onBuyNow} setActiveTab={setActiveTab} animDelay={i * 0.04} />;
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginTop: '2.5rem' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: currentPage === 1 ? 'var(--text-muted)' : '#000000',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: currentPage === 1 ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderRadius: '4px',
                          opacity: currentPage === 1 ? 0.5 : 1
                        }}
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => {
                        const pageNum = idx + 1;
                        const isPageActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              backgroundColor: isPageActive ? '#000000' : '#ffffff',
                              border: isPageActive ? '1px solid #000000' : '1px solid var(--border-color)',
                              color: isPageActive ? '#ffffff' : '#000000',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isPageActive) {
                                e.target.style.backgroundColor = '#f1f5f9';
                                e.target.style.borderColor = '#94a3b8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isPageActive) {
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.borderColor = 'var(--border-color)';
                              }
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          background: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: currentPage === totalPages ? 'var(--text-muted)' : '#000000',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: currentPage === totalPages ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderRadius: '4px',
                          opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, isWishlisted, onToggleWishlist, onProductClick, onAddToCart, onBuyNow, setActiveTab, animDelay = 0 }) {
  const isSoldOut = !product.inStock || product.badge === "Sold Out";
  const [hovered, setHovered] = React.useState(false);

  const fieldSet = (product.allow_customize !== undefined && product.allow_customize !== null) ||
                   (product.allowCustomize !== undefined && product.allowCustomize !== null) ||
                   (product.allow_customization !== undefined && product.allow_customization !== null);
  const adminAllowed = product.allow_customize === true || product.allow_customize === 'true' ||
                       product.allowCustomize === true || product.allowCustomize === 'true' ||
                       product.allow_customization === true || product.allow_customization === 'true';
  const nameLower = (product.name || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();
  const isCustomizable = fieldSet
    ? adminAllowed
    : (catLower.includes('keychain') || nameLower.includes('keychain') || nameLower.includes('key chain') || nameLower.includes('key tag'));

  const [isMobileScreen, setIsMobileScreen] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        className={`card-heart-btn ${isWishlisted ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
        title="Add to Wishlist"
      >
        <Heart size={14} fill={isWishlisted ? '#fff' : 'none'} />
      </button>

      {/* Image Container with 1:1 Aspect Ratio */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
            filter: hovered ? 'brightness(100%)' : 'brightness(97%)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)'
          }}
        />
        {product.originalPrice && product.price && product.originalPrice > product.price ? (
          <span style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            backgroundColor: '#000000', 
            color: '#ffffff', 
            fontSize: '0.6rem', 
            fontWeight: '800', 
            padding: '3px 8px', 
            borderRadius: '4px',
            textTransform: 'uppercase', 
            letterSpacing: '0.04em', 
            zIndex: 5,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </span>
        ) : product.badge ? (
          <span style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '10px', 
            backgroundColor: isSoldOut ? '#64748b' : 'var(--accent-orange)', 
            color: '#fff', 
            fontSize: '0.58rem', 
            fontWeight: '800', 
            padding: '3px 8px', 
            borderRadius: '4px',
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            zIndex: 5,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {product.badge}
          </span>
        ) : null}
      </div>

      {/* Details */}
      <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.35rem' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.35', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.3rem', marginBottom: '1px' }}>
          {product.name}
        </h3>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
          <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '700' }}>
            {product.rating} <Star size={9} fill="#000" style={{ color: '#000' }} />
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({product.reviewsCount} reviews)</span>
        </div>

        {isSoldOut ? (
          <button onClick={(e) => { e.stopPropagation(); onProductClick(product); }} className="btn-secondary" style={{ width: '100%', height: '32px', fontSize: '0.68rem', marginTop: 'auto', padding: 0 }}>
            Read More
          </button>
        ) : isCustomizable ? (
          <button
            onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
            style={{
              width: '100%',
              height: '32px',
              fontSize: isMobileScreen ? '0.68rem' : '0.72rem',
              fontWeight: '800',
              borderRadius: '6px',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              marginTop: 'auto',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#222222'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#000000'; }}
          >
            🎨 Customize in 3D Lab
          </button>
        ) : isMobileScreen ? (
          /* Mobile View: Stacked 2-Line Small Compact Buttons */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto', width: '100%' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              style={{
                width: '100%',
                height: '26px',
                fontSize: '0.64rem',
                fontWeight: '700',
                borderRadius: '5px',
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              title="Add item to cart"
            >
              <ShoppingCart size={11} /> Add to Cart
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBuyNow) {
                  onBuyNow(product);
                } else {
                  onAddToCart(product);
                  if (setActiveTab) setActiveTab('checkout');
                }
              }}
              style={{
                width: '100%',
                height: '26px',
                fontSize: '0.64rem',
                fontWeight: '800',
                borderRadius: '5px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222222'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000000'; }}
              title="Buy now and proceed to checkout"
            >
              ⚡ BUY NOW
            </button>
          </div>
        ) : (
          /* Desktop Button Layout */
          <div style={{ display: 'flex', gap: '5px', marginTop: 'auto', width: '100%' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
              style={{
                flex: 1,
                height: '32px',
                fontSize: '0.68rem',
                fontWeight: '700',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                transition: 'all 0.15s ease'
              }}
              title="Add item to cart"
            >
              <ShoppingCart size={11} /> Add
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onBuyNow) {
                  onBuyNow(product);
                } else {
                  onAddToCart(product);
                  if (setActiveTab) setActiveTab('checkout');
                }
              }}
              style={{
                flex: 1.2,
                height: '32px',
                fontSize: '0.68rem',
                fontWeight: '800',
                borderRadius: '6px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222222'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#000000'; }}
              title="Buy now and proceed to checkout"
            >
              ⚡ BUY NOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
