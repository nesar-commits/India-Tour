import { useEffect, useState } from "react";
import { NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StateDetail from "./pages/StateDetail.jsx";
import Places from "./pages/Places.jsx";
import Legal from "./pages/Legal.jsx";
import AuthLayout from "./auth/AuthLayout.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import SignupPage from "./auth/SignupPage.jsx";

// On the homepage the header sits transparently over the hero photos until you scroll past them.
function useHeaderOverHero(enabled) {
  const [overHero, setOverHero] = useState(enabled);
  useEffect(() => {
    if (!enabled) {
      setOverHero(false);
      return;
    }
    const update = () => {
      const hero = document.querySelector(".home-hero");
      setOverHero(!!hero && window.scrollY < hero.offsetHeight - 72);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);
  return overHero;
}

function MainLayout() {
  const isHome = useLocation().pathname === "/";
  const overHero = useHeaderOverHero(isHome);

  return (
    <>
      <header className={`topbar ${isHome ? "topbar-home" : ""} ${overHero ? "is-over-hero" : ""}`}>
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true" />
            India Tour
          </NavLink>
          <nav>
            <NavLink to="/" end>States</NavLink>
            <NavLink to="/places">All places</NavLink>
            <NavLink to="/login" className="nav-login">Log in</NavLink>
            <NavLink to="/signup" className="nav-cta">Sign up</NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer container">Data served by FastAPI · Built with React</footer>
    </>
  );
}

function Contained() {
  return (
    <div className="container">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route element={<Contained />}>
          <Route path="/states/:id" element={<StateDetail />} />
          <Route path="/places" element={<Places />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="*" element={<p className="status">Page not found.</p>} />
        </Route>
      </Route>
    </Routes>
  );
}
