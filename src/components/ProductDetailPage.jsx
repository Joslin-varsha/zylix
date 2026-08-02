import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star, Layers } from 'lucide-react';

export default function ProductDetailPage({ 
  product, 
  onBack, 
  onAddToCart, 
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

  if (!product) return null;

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
        
        {/* Left Column: Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            justify: 'center'
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
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
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" />)}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>4.9 (128 Reviews)</span>
            </div>

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
            const fieldSet = product.allow_customize !== undefined && product.allow_customize !== null;
            const adminAllowed = product.allow_customize === true || product.allow_customize === 'true';
            const nameLower = product.name.toLowerCase();
            const isCustomizable = fieldSet
              ? adminAllowed
              : (nameLower.includes('keychain') || nameLower.includes('key chain') || nameLower.includes('key tag'));

            if (isCustomizable && onCustomize) {
              // ━━━ CUSTOMIZE-ONLY MODE ━━━
              // Add to Cart shown but blocked — shows warning. Big Customize CTA is primary.
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>

                  {/* Big highlighted Customize button — PRIMARY CTA */}
                  <button
                    onClick={() => onCustomize(product)}
                    style={{
                      width: '100%',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '900',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 24px rgba(37,99,235,0.35)',
                      letterSpacing: '0.02em',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,0.35)'; }}
                    id="btn-customize-3d-lab"
                  >
                    🎨 Customize in 3D Print Lab
                  </button>

                  {/* Add to Cart — visible but shows warning when clicked */}
                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button
                      onClick={() => {
                        setCustomizeWarning(true);
                        setTimeout(() => setCustomizeWarning(false), 3500);
                      }}
                      style={{
                        flex: 1, height: '46px', fontSize: '0.88rem', fontWeight: '800',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px',
                        background: '#f1f5f9', color: '#64748b',
                        border: '1.5px solid #cbd5e1', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                    >
                      <ShoppingCart size={17} /> Add to Cart
                    </button>
                    <button
                      onClick={() => onToggleWishlist && onToggleWishlist(product)}
                      style={{
                        width: '46px', height: '46px', borderRadius: '10px',
                        backgroundColor: isWishlisted ? '#fef2f2' : '#ffffff',
                        border: isWishlisted ? '1px solid #fecaca' : '1px solid #cbd5e1',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
                      }}
                      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#475569'} style={{ display: 'block', margin: '0 auto' }} />
                    </button>
                  </div>

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

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                    <button
                      onClick={handleAddToCartClick}
                      className="btn-primary"
                      style={{ flex: 1, height: '48px', fontSize: '0.9rem', fontWeight: '800', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <ShoppingCart size={18} /> Add to Cart
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
    </div>
  );
}
