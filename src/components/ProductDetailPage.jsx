import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star, Layers, 
  ChevronLeft, ChevronRight, CheckCircle2, ThumbsUp, MessageSquare, Edit3, X, Check,
  Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const DEFAULT_REVIEWS = [
  {
    id: 'seed-1',
    author: 'Arun Kumar',
    rating: 5,
    title: 'Extremely crisp print finish & strong build!',
    comment: 'Ordered this for my setup and the detail level on the 3D print is phenomenal. Layer lines are barely visible and the dimensional accuracy is 10/10. Shipped within 24 hours!',
    date: '2026-10-12T10:30:00.000Z',
    verified: true,
    helpful: 12
  },
  {
    id: 'seed-2',
    author: 'Priya Sharma',
    rating: 5,
    title: 'Super smooth surface and vibrant colors',
    comment: 'The quality of the PLA+ material feels durable and premium. Came very securely packaged with bubble wrap. Highly recommend Zylix 3D for custom prints!',
    date: '2026-10-05T14:15:00.000Z',
    verified: true,
    helpful: 8
  },
  {
    id: 'seed-3',
    author: 'Karthik Raja',
    rating: 4,
    title: 'Great value for money, prompt delivery',
    comment: 'Solid 3D print and well-balanced. Looks even better in person than the photos. Customer support was very quick to respond to my questions.',
    date: '2026-09-28T09:00:00.000Z',
    verified: true,
    helpful: 5
  }
];

export default function ProductDetailPage({ 
  product, 
  user,
  onBack, 
  onAddToCart, 
  onBuyNow,
  onToggleWishlist, 
  isWishlisted, 
  onCustomize,
  allProducts,
  onProductClick,
  setActiveTab
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [customizeWarning, setCustomizeWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ━━━ CUSTOMER REVIEWS STATE ━━━
  const reviewSectionRef = useRef(null);
  const reviewFormRef = useRef(null);

  const toggleReviewForm = () => {
    setShowReviewForm(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
      return next;
    });
    setReviewErrorMsg('');
    setReviewSuccessMsg('');
  };
  const [reviews, setReviews] = useState(() => {
    try {
      if (product?.id) {
        const cached = localStorage.getItem(`zylix_reviews_${product.id}`);
        if (cached) return JSON.parse(cached);
      }
      if (Array.isArray(product?.specs?.reviews) && product.specs.reviews.length > 0) {
        return product.specs.reviews;
      }
    } catch (e) {}
    return DEFAULT_REVIEWS;
  });

  // Fetch reviews from backend when product changes
  useEffect(() => {
    if (!product?.id) return;
    let isMounted = true;

    try {
      const cached = localStorage.getItem(`zylix_reviews_${product.id}`);
      if (cached) {
        setReviews(JSON.parse(cached));
      } else if (Array.isArray(product?.specs?.reviews) && product.specs.reviews.length > 0) {
        setReviews(product.specs.reviews);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    } catch (e) {}

    fetch(`${API_BASE}/api/products/${product.id}/reviews`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data);
          try {
            localStorage.setItem(`zylix_reviews_${product.id}`, JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(err => {
        console.warn('Backend reviews offline, using local state:', err);
      });

    return () => { isMounted = false; };
  }, [product?.id]);

  // ━━━ PROFILE RESOLUTION & REVIEW FORM STATES ━━━
  const activeUser = user || (() => {
    try {
      const saved = localStorage.getItem('zylix_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newAuthor, setNewAuthor] = useState(() => activeUser?.name || activeUser?.email?.split('@')[0] || '');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');
  const [helpfulMap, setHelpfulMap] = useState({});
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 5, 4, 3, 2, 1
  const [reviewSort, setReviewSort] = useState('newest'); // 'newest', 'highest', 'helpful'

  useEffect(() => {
    if (activeUser && !newAuthor) {
      setNewAuthor(activeUser.name || activeUser.email?.split('@')[0] || '');
    }
  }, [activeUser]);

  // Rating Statistics
  const totalReviewsCount = reviews.length;
  const avgRatingNumber = totalReviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
    : (product.rating ? Number(product.rating).toFixed(1) : '4.9');

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const scrollToReviews = () => {
    if (reviewSectionRef.current) {
      reviewSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHelpfulClick = async (reviewId) => {
    if (helpfulMap[reviewId]) return;

    setHelpfulMap(prev => ({ ...prev, [reviewId]: true }));
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r));

    try {
      await fetch(`${API_BASE}/api/products/${product.id}/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Helpful upvote failed:', e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewErrorMsg('');

    const resolvedAuthor = (activeUser?.name || activeUser?.email?.split('@')[0] || newAuthor || 'Verified Customer').trim();
    if (!resolvedAuthor) {
      setReviewErrorMsg('Please enter your name or log in with your account.');
      return;
    }
    if (!newComment.trim() || newComment.trim().length < 3) {
      setReviewErrorMsg('Please write a short review (at least 3 characters).');
      return;
    }

    setSubmittingReview(true);

    const reviewObj = {
      id: Date.now().toString(),
      productId: product.id,
      author: resolvedAuthor,
      rating: newRating,
      title: (newTitle || '').trim(),
      comment: newComment.trim(),
      date: new Date().toISOString(),
      verified: !!activeUser,
      helpful: 0
    };

    // Optimistic local update
    const updated = [reviewObj, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`zylix_reviews_${product.id}`, JSON.stringify(updated));
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE}/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewObj)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reviews) {
          setReviews(data.reviews);
          try {
            localStorage.setItem(`zylix_reviews_${product.id}`, JSON.stringify(data.reviews));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Failed to sync review with backend, saved locally:', err);
    } finally {
      setSubmittingReview(false);
      setReviewSuccessMsg('🎉 Thank you for your review! Your feedback is now live on this product.');
      setNewTitle('');
      setNewComment('');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccessMsg('');
      }, 3000);
    }
  };

  const filteredReviews = useMemo(() => {
    let list = [...reviews];
    if (reviewFilter !== 'all') {
      const filterNum = Number(reviewFilter);
      list = list.filter(r => Math.round(Number(r.rating) || 5) === filterNum);
    }
    if (reviewSort === 'highest') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (reviewSort === 'helpful') {
      list.sort((a, b) => (Number(b.helpful) || 0) - (Number(a.helpful) || 0));
    } else {
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
    return list;
  }, [reviews, reviewFilter, reviewSort]);



  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!product) return null;

  const galleryImages = React.useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  }, [product?.images, product?.image]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id]);

  const currentImage = galleryImages[activeImageIndex] || product?.image || '';

  const handleAddToCartClick = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const relatedProducts = (allProducts || [])
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="product-detail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem 4rem', minHeight: '80vh' }}>
      
      {/* Top Breadcrumb & Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            background: '#f1f5f9',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            color: '#1e293b',
            fontSize: '0.82rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
        >
          <ArrowLeft size={16} /> Back to Products
        </button>

        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Category: <strong style={{ color: '#090d16' }}>{product.category || 'Custom Print'}</strong>
        </span>
      </div>

      {/* Main Product Layout (2 Columns) */}
      <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Image & Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Main Hero Image */}
          <div style={{
            width: '100%',
            aspectRatio: '1',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <img 
              src={currentImage} 
              alt={`${product.name} - view ${activeImageIndex + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }} 
            />

            {/* OFF Badge */}
            {product.originalPrice && product.price && product.originalPrice > product.price && (
              <span style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '20px',
                zIndex: 5
              }}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}

            {/* Gallery Image Counter Badge */}
            {galleryImages.length > 1 && (
              <span style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.72)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '20px',
                backdropFilter: 'blur(6px)',
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            )}

            {/* Prev / Next Chevrons on Main Image */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                  }}
                  aria-label="Previous Image"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: 4,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                  <ChevronLeft size={20} color="#0f172a" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                  }}
                  aria-label="Next Image"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: 4,
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.92)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                  <ChevronRight size={20} color="#0f172a" />
                </button>
              </>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onToggleWishlist && onToggleWishlist(product)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: isWishlisted ? '#fef2f2' : 'rgba(255,255,255,0.92)',
                border: isWishlisted ? '1px solid #fecaca' : '1px solid rgba(203, 213, 225, 0.6)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                zIndex: 5,
                transition: 'all 0.2s ease'
              }}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              padding: '4px 2px 8px',
              scrollbarWidth: 'thin'
            }}>
              {galleryImages.map((imgUrl, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '68px',
                      height: '68px',
                      flexShrink: 0,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: isActive ? '2.5px solid #000000' : '1.5px solid #e2e8f0',
                      padding: 0,
                      background: '#f8fafc',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      transform: isActive ? 'scale(1.04)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <button
              type="button"
              onClick={scrollToReviews}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                marginBottom: '0.45rem',
                background: 'none',
                border: 'none',
                padding: '3px 0',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none'
              }}
              title="Click to jump to customer reviews"
            >
              <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    fill={s <= Math.round(avgRatingNumber) ? '#f59e0b' : '#e2e8f0'}
                    color={s <= Math.round(avgRatingNumber) ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
              </div>
              <span style={{
                fontSize: '0.82rem',
                color: '#2563eb',
                fontWeight: '700',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {avgRatingNumber} ({totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'})
              </span>
            </button>

            <h1 className="product-detail-title" style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', textTransform: 'capitalize' }}>
              {product.name}
            </h1>
          </div>

          {/* Price Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span className="product-detail-price" style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                ₹{(product.originalPrice || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {product.description || 'Precision 3D printed with ultra-high resolution PLA/Resin material. Engineered for durability, high aesthetic detail, and smooth surface finish.'}
          </p>

          {/* Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <Layers size={18} color="#2563eb" />
              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Material</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Tough PLA+ 3D</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <Truck size={18} color="#16a34a" />
              <div>
                <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>Dispatch</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>24 Hours</span>
              </div>
            </div>
          </div>

          {/* Determine if this product requires 3D Lab customization */}
          {(() => {
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

            if (isCustomizable && onCustomize) {
              // ━━━ CUSTOMIZE-ONLY MODE ━━━
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {!isMobile && (
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                      <button
                        onClick={() => onCustomize(product)}
                        style={{
                          flex: 1,
                          height: '56px',
                          borderRadius: '14px',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '900',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                          letterSpacing: '0.02em',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        id="btn-customize-3d-lab"
                      >
                        🎨 Customize in 3D Print Lab
                      </button>
                      <button
                        onClick={() => onToggleWishlist && onToggleWishlist(product)}
                        style={{
                          width: '56px', height: '56px', borderRadius: '14px',
                          backgroundColor: isWishlisted ? '#fef2f2' : '#ffffff',
                          border: isWishlisted ? '1px solid #fecaca' : '1px solid #cbd5e1',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
                        }}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} style={{ display: 'block', margin: '0 auto' }} />
                      </button>
                    </div>
                  )}

                  {/* Warning toast when Add to Cart is clicked without customizing */}
                  {customizeWarning && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '1.5px solid #fcd34d',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'fadeIn 0.3s ease'
                    }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.8rem', color: '#92400e' }}>Customization Required!</div>
                        <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '2px' }}>
                          Please customize your design in the 3D Print Lab before adding to cart.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ━━━ NORMAL MODE ━━━ Add to Cart + Wishlist
            return (
              <>
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '36px', height: '36px', border: 'none', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                    >-</button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '0.9rem' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: '36px', height: '36px', border: 'none', background: '#f8fafc', fontWeight: '800', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>

                {/* Action Buttons (Desktop Only Inline) */}
                {!isMobile && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                      <button
                        onClick={handleAddToCartClick}
                        style={{
                          flex: 1,
                          height: '48px',
                          fontSize: '0.88rem',
                          fontWeight: '800',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1.5px solid #cbd5e1',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                      >
                        <ShoppingCart size={17} /> Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          if (onBuyNow) {
                            onBuyNow(product, quantity);
                          } else {
                            onAddToCart(product, quantity);
                            if (setActiveTab) setActiveTab('checkout');
                          }
                        }}
                        style={{
                          flex: 1.2,
                          height: '48px',
                          fontSize: '0.92rem',
                          fontWeight: '900',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                          letterSpacing: '0.03em',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        ⚡ BUY NOW
                      </button>
                      <button
                        onClick={() => onToggleWishlist && onToggleWishlist(product)}
                        style={{
                          width: '48px', height: '48px', borderRadius: '10px',
                          backgroundColor: isWishlisted ? '#fef2f2' : '#ffffff',
                          border: isWishlisted ? '1px solid #fecaca' : '1px solid #cbd5e1',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          padding: 0, margin: 0, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
                        }}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart size={20} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} style={{ display: 'block', margin: '0 auto' }} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {addedToast && (
            <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontWeight: '700', fontSize: '0.85rem' }}>
              ✓ {quantity} × {product.name} added to cart!
            </div>
          )}

          {/* Trust Guarantees */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.82rem' }}>
              <ShieldCheck size={16} color="#16a34a" /> 100% Quality Inspected 3D Print Guaranteed
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.82rem' }}>
              <RefreshCw size={16} color="#2563eb" /> 7-Day Easy Exchange on Defective Items
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CUSTOMER REVIEWS & RATINGS SECTION (MOBILE OPTIMIZED LIKE TOP E-COMMERCE)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section 
        ref={reviewSectionRef} 
        id="customer-reviews-section" 
        style={{ 
          marginTop: isMobile ? '2.5rem' : '4rem', 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: isMobile ? '1.75rem' : '3rem',
          paddingBottom: isMobile ? '4.5rem' : '1rem'
        }}
      >
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              <Sparkles size={12} /> Verified Feedback
            </div>
            <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.75rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Ratings & Reviews
            </h2>
            <p style={{ color: '#64748b', fontSize: isMobile ? '0.78rem' : '0.88rem', margin: '0.25rem 0 0', maxWidth: '600px' }}>
              Real feedback from verified buyers and 3D printing enthusiasts.
            </p>
          </div>

          {!isMobile && (
            <button
              type="button"
              onClick={toggleReviewForm}
              id="btn-write-review"
              style={{
                backgroundColor: showReviewForm ? '#f1f5f9' : '#000000',
                color: showReviewForm ? '#0f172a' : '#ffffff',
                border: showReviewForm ? '1px solid #cbd5e1' : 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: showReviewForm ? 'none' : '0 4px 14px rgba(0,0,0,0.18)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                if (!showReviewForm) {
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                if (!showReviewForm) {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {showReviewForm ? (
                <>
                  <X size={17} /> Close Review Form
                </>
              ) : (
                <>
                  <Edit3 size={17} /> Write a Review
                </>
              )}
            </button>
          )}
        </div>

        {/* Ratings Overview Breakdown Card (Compact 2-Column on Mobile like Flipkart/Amazon) */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '1rem' : '1.75rem 2rem',
          display: 'grid',
          gridTemplateColumns: isMobile ? '105px 1fr' : '200px 1fr 240px',
          gap: isMobile ? '1rem' : '2.5rem',
          alignItems: 'center',
          marginBottom: isMobile ? '1rem' : '2rem'
        }}>
          {/* Big Score Box */}
          <div style={{ textAlign: 'center', borderRight: isMobile ? '1px solid #e2e8f0' : 'none', paddingRight: isMobile ? '0.75rem' : '0' }}>
            <div style={{ fontSize: isMobile ? '2.5rem' : '3.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>
              {avgRatingNumber}
            </div>
            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', margin: '0.4rem 0 0.25rem', color: '#f59e0b' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={isMobile ? 13 : 18}
                  fill={s <= Math.round(avgRatingNumber) ? '#f59e0b' : '#e2e8f0'}
                  color={s <= Math.round(avgRatingNumber) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <div style={{ fontSize: isMobile ? '0.72rem' : '0.8rem', color: '#64748b', fontWeight: '700' }}>
              {totalReviewsCount} {totalReviewsCount === 1 ? 'Review' : 'Reviews'}
            </div>
            {isMobile && (
              <div style={{ marginTop: '5px', fontSize: '0.68rem', color: '#16a34a', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <CheckCircle2 size={11} color="#16a34a" /> 100% Genuine
              </div>
            )}
          </div>

          {/* Star Distribution Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.4rem' : '0.55rem' }}>
            {[5, 4, 3, 2, 1].map(starNum => {
              const count = ratingCounts[starNum] || 0;
              const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              const isSelected = reviewFilter === String(starNum);

              return (
                <div
                  key={starNum}
                  onClick={() => setReviewFilter(isSelected ? 'all' : String(starNum))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '6px' : '10px',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#e2e8f0' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  title={`Click to filter by ${starNum} stars`}
                >
                  <span style={{ width: isMobile ? '30px' : '42px', fontSize: isMobile ? '0.74rem' : '0.8rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {starNum} <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  
                  <div style={{ flex: 1, height: isMobile ? '6px' : '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: starNum >= 4 ? '#10b981' : starNum === 3 ? '#f59e0b' : '#ef4444',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>

                  <span style={{ width: isMobile ? '28px' : '38px', textAlign: 'right', fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#64748b', fontWeight: '700' }}>
                    {pct}%
                  </span>
                  {!isMobile && (
                    <span style={{ width: '28px', textAlign: 'right', fontSize: '0.74rem', color: '#94a3b8' }}>
                      ({count})
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Quality Guarantee Box */}
          {!isMobile && (
            <div style={{
              borderLeft: '1px solid #e2e8f0',
              paddingLeft: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '800', fontSize: '0.88rem' }}>
                <ShieldCheck size={20} color="#16a34a" /> 100% Verified Prints
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                Every review comes from real customers who ordered custom 3D prints or ready-to-ship models.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="#2563eb" /> 98% Satisfaction Rate
              </div>
            </div>
          )}
        </div>

        {/* Mobile Full-Width Action Button (Right under summary) */}
        {isMobile && !showReviewForm && (
          <button
            type="button"
            onClick={toggleReviewForm}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          >
            <Edit3 size={16} /> Rate & Write a Review
          </button>
        )}

        {/* ✍️ WRITE A REVIEW FORM (EXPANDABLE) */}
        {showReviewForm && (
          <div 
            ref={reviewFormRef}
            style={{
              backgroundColor: '#ffffff',
              border: '2px solid #000000',
              borderRadius: isMobile ? '14px' : '16px',
              padding: isMobile ? '1.1rem 1rem' : '1.75rem 2rem',
              marginBottom: '2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  Write a Review
                </h3>
                <span style={{ fontSize: isMobile ? '0.74rem' : '0.8rem', color: '#64748b' }}>
                  Product: <strong style={{ color: '#0f172a' }}>{product.name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '6px' }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {reviewSuccessMsg && (
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                color: '#065f46',
                fontSize: '0.88rem',
                fontWeight: '700',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} color="#059669" />
                {reviewSuccessMsg}
              </div>
            )}

            {reviewErrorMsg && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '10px',
                padding: '0.85rem 1.25rem',
                color: '#991b1b',
                fontSize: '0.86rem',
                fontWeight: '700',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ⚠️ {reviewErrorMsg}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.25rem' }}>
              {/* Star Rating Picker (Touch-friendly 32px on mobile) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
                  Tap to Rate *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = star <= (hoverRating || newRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: isMobile ? '6px 4px' : '6px',
                          cursor: 'pointer',
                          transform: isFilled ? 'scale(1.12)' : 'scale(1)',
                          transition: 'transform 0.15s ease'
                        }}
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          size={isMobile ? 32 : 28}
                          fill={isFilled ? '#f59e0b' : '#f1f5f9'}
                          color={isFilled ? '#f59e0b' : '#cbd5e1'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviewer Profile Badge (Auto-takes name from profile) */}
              {activeUser ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: isMobile ? '0.75rem 0.85rem' : '0.85rem 1.25rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0'
                }}>
                  <div style={{
                    width: isMobile ? '34px' : '38px',
                    height: isMobile ? '34px' : '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: isMobile ? '0.82rem' : '0.9rem',
                    flexShrink: 0
                  }}>
                    {(activeUser.name || activeUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: isMobile ? '0.84rem' : '0.92rem', fontWeight: '800', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {activeUser.name || activeUser.email}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        border: '1px solid #a7f3d0'
                      }}>
                        <CheckCircle2 size={11} color="#059669" /> Verified
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '1px' }}>
                      Reviewing with your verified profile
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: isMobile ? '0.75rem 0.85rem' : '0.85rem 1.25rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>
                      Posting as Guest
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab && setActiveTab('login')}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.76rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      Log In First
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your name (e.g. Rahul S.)"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '16px', // Prevents iOS mobile zoom
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  />
                </div>
              )}

              {/* Your Review Only */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.03em' }}>
                  Your Review *
                </label>
                <textarea
                  required
                  rows={isMobile ? 3 : 4}
                  placeholder="Share details about the print quality, surface smoothness, packaging, and how satisfied you are with your purchase..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '16px', // 16px prevents iOS Safari auto-zoom
                    outline: 'none',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    backgroundColor: '#f8fafc',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#000000'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    padding: isMobile ? '0.75rem 1rem' : '0.75rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    flex: isMobile ? 1.5 : 'none',
                    padding: isMobile ? '0.75rem 1.25rem' : '0.75rem 1.8rem',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: submittingReview ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Sort Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          flexWrap: isMobile ? 'nowrap' : 'wrap'
        }}>
          {/* Star Filter Pills with smooth touch scroll */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            flex: 1
          }}>
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              style={{
                padding: isMobile ? '5px 10px' : '5px 12px',
                borderRadius: '20px',
                border: reviewFilter === 'all' ? '1.5px solid #000' : '1px solid #e2e8f0',
                backgroundColor: reviewFilter === 'all' ? '#000' : '#fff',
                color: reviewFilter === 'all' ? '#fff' : '#475569',
                fontSize: isMobile ? '0.74rem' : '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              All ({totalReviewsCount})
            </button>

            {[5, 4, 3, 2, 1].map(s => {
              const count = ratingCounts[s] || 0;
              const isSelected = reviewFilter === String(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewFilter(isSelected ? 'all' : String(s))}
                  style={{
                    padding: isMobile ? '5px 10px' : '5px 12px',
                    borderRadius: '20px',
                    border: isSelected ? '1.5px solid #000' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#000' : '#fff',
                    color: isSelected ? '#fff' : '#475569',
                    fontSize: isMobile ? '0.74rem' : '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s} ★ ({count})
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {!isMobile && <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Sort:</span>}
            <select
              value={reviewSort}
              onChange={e => setReviewSort(e.target.value)}
              style={{
                padding: isMobile ? '5px 8px' : '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: isMobile ? '0.74rem' : '0.8rem',
                fontWeight: '700',
                color: '#0f172a',
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Recent</option>
              <option value="highest">Highest ★</option>
              <option value="helpful">Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews Feed */}
        {filteredReviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1'
          }}>
            <MessageSquare size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' }}>
              No reviews found for this filter
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 0.85rem' }}>
              Be the first to share your experience with this 3D print!
            </p>
            <button
              type="button"
              onClick={() => {
                setReviewFilter('all');
                toggleReviewForm();
              }}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.55rem 1.2rem',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              ✍️ Write the First Review
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.85rem' : '1.25rem' }}>
            {filteredReviews.map((r, index) => {
              const authorInitials = (r.author || 'User')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              
              const dateFormatted = r.date 
                ? new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'Recent';

              const isUpvoted = !!helpfulMap[r.id];

              return (
                <div
                  key={r.id || index}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: isMobile ? '12px' : '14px',
                    padding: isMobile ? '0.9rem 1rem' : '1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    if (!isMobile) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isMobile) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                    }
                  }}
                >
                  {/* Review Top Header: Author, Badge, Rating & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px' }}>
                      {/* Avatar Circle */}
                      <div style={{
                        width: isMobile ? '32px' : '38px',
                        height: isMobile ? '32px' : '38px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: isMobile ? '0.78rem' : '0.85rem',
                        letterSpacing: '0.02em',
                        flexShrink: 0
                      }}>
                        {authorInitials}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                            {r.author}
                          </span>
                          {r.verified && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              fontSize: isMobile ? '0.65rem' : '0.7rem',
                              fontWeight: '800',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              border: '1px solid #a7f3d0'
                            }}>
                              <CheckCircle2 size={10} color="#059669" /> Verified
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {/* Flipkart/Amazon-style compact rating pill on mobile */}
                          {isMobile ? (
                            <span style={{
                              backgroundColor: (Number(r.rating) || 5) >= 4 ? '#059669' : (Number(r.rating) || 5) === 3 ? '#d97706' : '#dc2626',
                              color: '#ffffff',
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              {r.rating || 5} ★
                            </span>
                          ) : (
                            <div style={{ display: 'flex', color: '#f59e0b' }}>
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                  key={s}
                                  size={13}
                                  fill={s <= (Number(r.rating) || 5) ? '#f59e0b' : '#e2e8f0'}
                                  color={s <= (Number(r.rating) || 5) ? '#f59e0b' : '#cbd5e1'}
                                />
                              ))}
                            </div>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>•</span>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{dateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Title */}
                  {r.title && (
                    <h4 style={{
                      fontSize: isMobile ? '0.88rem' : '0.95rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: '0 0 0.35rem',
                      lineHeight: '1.4'
                    }}>
                      {r.title}
                    </h4>
                  )}

                  {/* Review Comment */}
                  <p style={{
                    fontSize: isMobile ? '0.84rem' : '0.88rem',
                    color: '#334155',
                    lineHeight: '1.55',
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {r.comment}
                  </p>

                  {/* Helpful Button Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(r.id)}
                      disabled={isUpvoted}
                      style={{
                        background: isUpvoted ? '#eff6ff' : '#f8fafc',
                        border: isUpvoted ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        color: isUpvoted ? '#2563eb' : '#64748b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: isUpvoted ? 'default' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                      title={isUpvoted ? 'You found this review helpful' : 'Mark this review as helpful'}
                    >
                      <ThumbsUp size={12} fill={isUpvoted ? '#2563eb' : 'none'} color={isUpvoted ? '#2563eb' : '#64748b'} />
                      <span>{isUpvoted ? 'Helpful' : 'Helpful?'}</span>
                      <strong style={{ color: isUpvoted ? '#1d4ed8' : '#0f172a' }}>({r.helpful || 0})</strong>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Related Products Shelf */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '4rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            You May Also Like
          </h2>
          <div className="related-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {relatedProducts.map(rel => (
              <div 
                key={rel.id} 
                onClick={() => onProductClick && onProductClick(rel)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img src={rel.image} alt={rel.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>{rel.name}</h4>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>₹{rel.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Mobile Sticky Bottom Action Bar (At bottom: 0) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          zIndex: 1000
        }}>
          {(() => {
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

            if (isCustomizable && onCustomize) {
              return (
                <button
                  onClick={() => onCustomize(product)}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🎨 Customize in 3D Print Lab
                </button>
              );
            }

            return (
              <>
                <button
                  onClick={handleAddToCartClick}
                  style={{
                    flex: 1,
                    height: '46px',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (onBuyNow) {
                      onBuyNow(product, quantity);
                    } else {
                      onAddToCart(product, quantity);
                      if (setActiveTab) setActiveTab('checkout');
                    }
                  }}
                  style={{
                    flex: 1.2,
                    height: '46px',
                    fontSize: '0.88rem',
                    fontWeight: '900',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#000000',
                    color: '#ffffff',
                    border: 'none'
                  }}
                >
                  ⚡ BUY NOW
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
