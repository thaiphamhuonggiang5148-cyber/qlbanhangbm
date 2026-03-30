import React from 'react';
import './Login.css';

const Register = ({ onSwitchLogin }) => {
  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-header">
          <h1 className="brand-name">SoulMade</h1>
        </div>

        <h2 className="form-title">Đăng Ký Tài Khoản</h2>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>Full Name <span className="star">*</span></label>
            <input type="text" placeholder="Nhập họ tên..." required />
          </div>

          <div className="input-field">
            <label>Email Address <span className="star">*</span></label>
            <input type="email" placeholder="Nhập email..." required />
          </div>

          <div className="input-field">
            <label>Password<span className="star">*</span></label>
            <input type="password" placeholder="Tạo mật khẩu..." required />
          </div>

          <div className="input-field">
            <label>Confirm Password<span className="star">*</span></label>
            <input type="password" placeholder="Nhập lại mật khẩu..." required />
          </div>

          <button type="submit" className="submit-btn">ĐĂNG KÝ NGAY</button>
        </form>

        <p className="signup-link">
          Đã có tài khoản? <span className="switch-btn" onClick={onSwitchLogin}>Đăng nhập</span>
        </p>
      </div>
    </div>
  );
};

export default Register;