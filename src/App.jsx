import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ProductList from "./components/Products/ProductList";
import DetailProduct from "./components/Products/DetailProduct";

// Import thêm các component đang được gọi từ Header
// import Cart from "./components/Cart/Cart";
// import Login from "./components/Login/Login";

export default function App() {
  return (
    <BrowserRouter>
      <div
        className="app-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<DetailProduct />} />
            
            {/* Bổ sung các route bị thiếu */}
            {/* <Route path="/cart" element={<Cart />} /> */}
            {/* <Route path="/login" element={<Login />} /> */}
            
            {/* Nên có một route 404 để bắt các đường dẫn không tồn tại */}
            {/* <Route path="*" element={<div>Trang không tồn tại</div>} /> */}
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
}