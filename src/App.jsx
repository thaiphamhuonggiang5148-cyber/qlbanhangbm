import React, { Profiler, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from "./components/Footer/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import DetailProduct from "./components/Products/DetailProduct";
import ProductCard from './components/Products/ProductCard';
import ProductList from './components/Products/ProductList';
import Login from './components/Pages/Login';
import Signup from './components/Pages/Signup';
import Cart from './components/Pages/Cart';
function App() {
  const location = useLocation();

  const hideChrome =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/admin';

  return (
    <>
      {!hideChrome && <Header />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <ProductList />
            </>
          }
        />
        
        <Route path="/product/:id" element={<DetailProduct />} />

        <Route path="/cart" element={<Cart/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>

      </Routes>

      {!hideChrome && <Footer />}
    </>
  );
}

export default App;