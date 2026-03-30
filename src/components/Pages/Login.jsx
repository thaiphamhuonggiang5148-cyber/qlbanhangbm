import React, { useState } from 'react';
import './Login.css';

const Login = ({ onSwitchRegister, onSwitchForgot }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <div className="login-header">
          <h1 className="brand-name">SoulMade</h1>
        </div>

        <h2 className="form-title">Đăng Nhập</h2>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-field">
            <label>Email Address<span className="star">*</span></label>
            <input type="email" placeholder="Nhập email..." required />
          </div>

          <div className="input-field">
            <label>Password<span className="star">*</span></label>
            <div className="password-container">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu..." 
                required 
              />
              <button 
                type="button" 
                className="eye-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" /> Ghi nhớ mật khẩu
            </label>
            <span className="forgot-pw" onClick={onSwitchForgot}>Quên mật khẩu?</span>
          </div>

          <button type="submit" className="submit-btn">ĐĂNG NHẬP</button>
        </form>

        <p className="signup-link">
          Chưa có tài khoản? <span className="switch-btn" onClick={onSwitchRegister}>Đăng ký ngay</span>
        </p>
      </div>
    </div>
  );
};

export default Login;