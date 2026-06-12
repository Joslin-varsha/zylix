import React from 'react';
import { X, Star } from 'lucide-react';

export default function ProductDetailModal({ product, onClose, onAddToCart, onCustomize }) {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedSpecTab, setSelectedSpecTab] = React.useState('specs');

  if (!product) return null;

  const isCustomizable = 
    product.name.toLowerCase().includes('custom') || 
    product.name.toLowerCase().includes('personalized') || 
    product.category === 'keychains' || 
    product.category === 'lightbox' || 
    product.badge === 'CUSTOM';

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const reviews = [
    { name: "Rahul S.", rating: 5, date: "12 May 2026", comment: "Outstanding build quality! Replaced my old printer bed and it worked instantly. Prints are highly consistent." },
    { name: "Divya M.", rating: 4, date: "28 April 2026", comment: "Perfect for student prototypes. Used this for drone arms. Stiff structural hold under minor crash load tests." }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 150,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }} onClick={onClose}>
      
      {/* Modal Container */}
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          color: '#000000',
          overflowY: 'auto',
          position: 'relative',
          padding: 0,
          cursor: 'default',
          animation: 'fadeIn 0.2s ease-out',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: '#000',
            cursor: 'pointer',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <X size={18} />
        </button>

        {/* Product Details Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 0
        }}>
          {/* Column 1: Image & Badges */}
          <div style={{
            padding: '2.5rem',
            borderRight: '1px solid var(--border-color)',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              position: 'relative'
            }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(30%)'
                }}
              />
            </div>
            {product.badge && (
              <span className="badge" style={{ marginTop: '1rem', alignSelf: 'flex-start', background: '#000', color: '#fff' }}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Column 2: Information & Config */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header info */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {product.categoryLabel}
              </span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.25rem', color: '#000', lineHeight: '1.2' }}>{product.name}</h2>
              
              {/* Rating summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', color: '#000' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(product.rating) ? '#000' : 'none'} 
                      style={{ color: i < Math.floor(product.rating) ? '#000' : 'var(--text-muted)' }} 
                    />
                  ))}
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', marginLeft: '6px' }}>{product.rating}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({product.reviewsCount} verified purchases)</span>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {product.description}
            </p>

            {/* Price & Quantity Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              borderBottom: '1px solid var(--border-color)',
              padding: '1rem 0'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit Price</span>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: '#000' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Quantity selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity</span>
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', background: '#fff' }}>
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#000',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    -
                  </button>
                  <div style={{
                    width: '40px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#000',
                    borderLeft: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)'
                  }}>
                    {quantity}
                  </div>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#000',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Spec & Reviews TABS */}
            <div>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <button
                  onClick={() => setSelectedSpecTab('specs')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: selectedSpecTab === 'specs' ? '2px solid #000' : '2px solid transparent',
                    color: selectedSpecTab === 'specs' ? '#000' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    padding: '0.5rem 1rem 0.5rem 0',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Technical Specs
                </button>
                <button
                  onClick={() => setSelectedSpecTab('reviews')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: selectedSpecTab === 'reviews' ? '2px solid #000' : '2px solid transparent',
                    color: selectedSpecTab === 'reviews' ? '#000' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {/* Specs Content */}
              {selectedSpecTab === 'specs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                      <span style={{ fontWeight: '500', color: '#000' }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews Content */}
              {selectedSpecTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reviews.map((rev, index) => (
                    <div key={index} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#000' }}>{rev.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                      </div>
                      <div style={{ display: 'flex', color: '#000', gap: '1px', marginBottom: '0.25rem' }}>
                        {[...Array(5)].map((_, rIdx) => (
                          <Star key={rIdx} size={10} fill={rIdx < rev.rating ? '#000' : 'none'} style={{ color: rIdx < rev.rating ? '#000' : 'var(--text-muted)' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', width: '100%' }}>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button 
                  onClick={handleAddToCart}
                  className="btn-primary" 
                  style={{ flex: 1, height: '45px' }}
                >
                  Add to Shopping Cart
                </button>
                <button 
                  onClick={onClose}
                  className="btn-secondary" 
                  style={{ padding: '0.75rem' }}
                >
                  Cancel
                </button>
              </div>
              {isCustomizable && onCustomize && (
                <button 
                  onClick={() => {
                    onCustomize(product);
                    onClose();
                  }}
                  className="btn-primary" 
                  style={{ 
                    width: '100%', 
                    height: '42px', 
                    background: '#000000', 
                    color: '#ffffff', 
                    border: '1px solid #000000',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  ✨ Customize Design in 3D Lab
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
