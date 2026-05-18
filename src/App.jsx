import React, { Profiler, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from "./components/Footer/Footer";
import '@fortawesome/fontawesome-free/css/all.min.css';
import DetailProduct from "./components/Body/DetailProduct";
import ProductCard from './components/Body/ProductCard';
import ProductList from './components/Body/ProductList';
import Login from './components/Pages/Login';
import Signup from './components/Pages/Signup';
import Cart from './components/Pages/Cart';
import Admin from './components/Pages/Admin';
import Banner from './components/Body/Banner';
import AdminBill from './components/Pages/AdminBill';
import AdminCategory from './components/Pages/AdminCategory';
import AdminCustomer from './components/Pages/AdminCustomer';
import AdminEmployee from './components/Pages/AdminEmployee';
import AdminInvoiceDetails from './components/Pages/AdminInvoiceDetails';
import AdminProduct from './components/Pages/AdminProduct';
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
              <Banner />
              <ProductList />
            </>
          }
        />

        <Route path="/product/:id" element={<DetailProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin" element={<AdminBill />} />
        <Route path="/admin" element={<AdminCategory />} />
        <Route path="/admin" element={<AdminCustomer />} />
        <Route path="/admin" element={<AdminEmployee />} />
        <Route path="/admin" element={<AdminInvoiceDetails />} />
        <Route path="/admin" element={<AdminProduct />} />
      </Routes>

      {!hideChrome && <Footer />}
    </>
  );
}

export default App;