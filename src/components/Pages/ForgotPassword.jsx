import React from 'react';
import './Login.css';

const ForgotPassword = ({ onSwitchLogin }) => {
  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-header">
          <h1 className="brand-name">SoulMade</h1>
        </div>

        <h2 className="form-title">Quên Mật Khẩu</h2>
        <p className="info-text">
          Nhập email đăng ký, G-Handmade sẽ gửi hướng dẫn khôi phục mật khẩu.
        </p>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>Email Address<span className="star">*</span></label>
            <input type="email" placeholder="example@gmail.com" required />
          </div>

          <button type="submit" className="submit-btn">GỬI YÊU CẦU</button>
        </form>

        <p className="signup-link">
          Nhớ ra mật khẩu? <span className="switch-btn" onClick={onSwitchLogin}>Quay lại Đăng nhập</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;