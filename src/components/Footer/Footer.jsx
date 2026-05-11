import React from 'react';
import './Footer.css';
import logo from '../../img/logo.png';

const Footer = () => {
  return (
    <footer className="highlands-footer">
      {/* Green strip at the top */}
      <div className="footer-green-strip"></div>

      <div className="footer-content">
        {/* Left Section: Logo and Copyright */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src={logo} alt="Highlands Coffee" className="footer-logo-img" />
          </div>
          <p className="footer-copyright">
            ©2025 Galaxy Cafe. All rights reserved
          </p>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="footer-middle">
          {/* Column 1: VỀ HIGHLANDS */}
          <div className="footer-column">
            <h3 className="footer-column-title">VỀ GALAXYCAFE</h3>
            <ul className="footer-links">
              <li><a href="/origin">Nguồn gốc</a></li>
              <li><a href="/services">Dịch vụ</a></li>
              <li><a href="/careers">Nghề Nghiệp</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          {/* Column 2: HỆ THỐNG CỬA HÀNG */}
          <div className="footer-column">
            <h3 className="footer-column-title">HỆ THỐNG CỬA HÀNG</h3>
            <ul className="footer-links">
              <li><a href="/find-store">Tìm cửa hàng gần nhất</a></li>
            </ul>
          </div>

          {/* Column 3: TIN TỨC */}
          <div className="footer-column">
            <h3 className="footer-column-title">TIN TỨC</h3>
            <ul className="footer-links">
              {/* No sub-links visible in the image */}
            </ul>
          </div>
        </div>

        {/* Right Section: Social Media */}
        <div className="footer-right">
          <h3 className="footer-column-title">THEO DÕI CHÚNG TÔI</h3>
          <div className="footer-social-icons">
            <a href="https://facebook.com" className="social-icon" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" className="social-icon" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com" className="social-icon" aria-label="YouTube">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://tiktok.com" className="social-icon" aria-label="TikTok">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>

          <div className="footer-map">
            <iframe
              title="Bản đồ địa điểm Galaxy Cafe"
              className="footer-map__iframe"
              src="https://www.google.com/maps?q=10.743902,106.6340446&z=17&output=embed&hl=vi"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              className="footer-map__link"
              href="https://maps.app.goo.gl/6RuUrqKaYAFspPe57"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mở trong Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Chat Icon */}
      <div className="footer-chat-icon" title="Chat với chúng tôi">
        <i className="fas fa-comment-dots"></i>
      </div>
    </footer>
  );
};

export default Footer;