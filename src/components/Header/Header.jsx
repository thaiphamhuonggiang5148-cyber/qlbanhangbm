import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logoImage from '../../img/logo.png';

const Header = () => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) {
        setCartCount(0);
      } else {
        try {
          const cart = JSON.parse(savedCart);
          const totalItems = cart.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );
          setCartCount(totalItems);
        } catch (error) {
          console.error('Lỗi đọc giỏ hàng:', error);
          setCartCount(0);
        }
      }
    };

    const updateCurrentUser = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Lỗi đọc thông tin người dùng:', error);
        setCurrentUser(null);
      }
    };

    updateCartCount();
    updateCurrentUser();

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('userUpdated', updateCurrentUser);
    window.addEventListener('storage', () => {
      updateCartCount();
      updateCurrentUser();
    });

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('userUpdated', updateCurrentUser);
      window.removeEventListener('storage', () => {
        updateCartCount();
        updateCurrentUser();
      });
    };
  }, []);

  const coffeeMenuItems = [
    { text: 'Hành trình tách cà phê đậm', href: '/coffee/hanh-trinh-tach-ca-phe' },
    { text: 'Hạt cà phê Phúc Long', href: '/coffee/hat-ca-phe-phuc-long' },
    { text: 'Nghệ thuật pha chế', href: '/coffee/nghe-thuat-pha-che' }
  ];

  return (
    <header className="phuclong-header">
      <div className="header-top-bar">
        <div className="header-top-content">
          <div className="header-delivery-info">
            <span className="delivery-text">Free Delivery</span>
            <i className="fas fa-phone delivery-icon"></i>
            <span className="delivery-phone">1800 6779</span>
            <div className="delivery-scooter">
              <i className="fas fa-motorcycle"></i>
            </div>
          </div>

          <div className="header-logo-container">
            <div className="phuclong-logo">
              <img src={logoImage} alt="Logo" className="header-logo-image" />
            </div>
          </div>

          <div className="header-user-actions">
            <button
              className="login-link"
              onClick={() => navigate('/login')}
            >
              {currentUser ? (currentUser.name || currentUser.user) : 'Đăng nhập'}
            </button>
            <span className="action-separator">|</span>
            <div className="language-selector">
              <span className="lang-active">VN</span>
              <span className="lang-separator">|</span>
              <span className="lang-option">EN</span>
            </div>
            <button
              className="cart-button"
              onClick={() => navigate('/cart')}
            >
              <i className="fas fa-shopping-cart"></i>
              <span>Giỏ hàng</span>
              <span className="cart-badge">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="header-navigation">
        <div className="nav-content">
          <a href="/" className="nav-link">TRANG CHỦ</a>

          <div 
            className="nav-item-with-dropdown"
            onMouseEnter={() => setHoveredMenu('coffee')}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            <a href="/coffee" className={`nav-link ${hoveredMenu === 'coffee' ? 'active' : ''}`}>
              CÀ PHÊ
            </a>
            {hoveredMenu === 'coffee' && (
              <div className="dropdown-menu">
                {coffeeMenuItems.map((item, index) => (
                  <a 
                    key={index}
                    href={item.href}
                    className="dropdown-item"
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/tea" className="nav-link">TRÀ</a>
          <a href="/drinks" className="nav-link">THỨC UỐNG</a>
          <a href="/products" className="nav-link">SẢN PHẨM</a>
          <a href="/promotions" className="nav-link">KHUYẾN MÃI</a>
          <a href="/about" className="nav-link">VỀ CHÚNG TÔI</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;