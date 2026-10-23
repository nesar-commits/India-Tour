import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StateDetail from "./pages/StateDetail.jsx";
import Places from "./pages/Places.jsx";

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            India Tour
          </NavLink>
          <nav>
            <NavLink to="/" end>States</NavLink>
            <NavLink to="/places">All places</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/states/:id" element={<StateDetail />} />
          <Route path="/places" element={<Places />} />
          <Route path="*" element={<p className="status">Page not found.</p>} />
        </Routes>
      </main>
      <footer className="footer container">Data served by FastAPI · Built with React</footer>
    </>
  );
}
