import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Header/Header";

export default function App() {
  const [page, setPage] = useState("login");

  return (
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
}