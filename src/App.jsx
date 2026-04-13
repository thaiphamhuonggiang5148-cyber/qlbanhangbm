import React from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        
        <main style={{ padding: "0" }}>
          
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}