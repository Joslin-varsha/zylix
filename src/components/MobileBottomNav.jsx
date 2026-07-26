import React from 'react';
import { Home, Heart, ShoppingBag, Package } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab, setActiveCategory, cartCount, wishlistCount, onOpenWishlist, onCloseWishlist, onCloseCart }) {
  const navItems = [
    { id: 'shop', label: 'Home', Icon: Home },
    { id: 'wishlist', label: 'Wishlist', Icon: Heart, badge: wishlistCount, isAction: true },
    { id: 'cart', label: 'Cart', Icon: ShoppingBag, badge: cartCount },
    { id: 'orders', label: 'Orders', Icon: Package }
  ];

  return (
    <nav className="mobile-bottom-dock">
      {navItems.map(({ id, label, Icon, badge, isAction }) => {
        const isActive = activeTab === id || (id === 'shop' && activeTab === 'products');
        return (
          <button
            key={id}
            onClick={() => {
              if (onCloseWishlist) onCloseWishlist();
              if (onCloseCart) onCloseCart();
              if (isAction && onOpenWishlist) {
                onOpenWishlist();
              } else if (id === 'shop') {
                setActiveTab('shop');
                if (setActiveCategory) setActiveCategory('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveTab(id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`mobile-dock-item ${isActive ? 'active' : ''}`}
          >
            <div className="mobile-dock-icon-wrapper">
              <Icon size={20} />
              {badge > 0 && <span className="mobile-dock-badge">{badge}</span>}
            </div>
            <span className="mobile-dock-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
