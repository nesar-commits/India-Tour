import { useEffect, useState } from "react";
import { NavLink, Outlet, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StateDetail from "./pages/StateDetail.jsx";
import Places from "./pages/Places.jsx";
import Legal from "./pages/Legal.jsx";
import AuthLayout from "./auth/AuthLayout.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import SignupPage from "./auth/SignupPage.jsx";
import { kiteLaunchHandlers } from "./effects/kiteFlight.js";

// On pages with a photo hero the header sits transparently over it until you scroll past.
function useHeaderOverHero(enabled, pathname) {
  const [overHero, setOverHero] = useState(enabled);
  useEffect(() => {
    if (!enabled) {
      setOverHero(false);
      return;
    }
    const update = () => {
      const hero = document.querySelector(".page-hero");
      setOverHero(!!hero && window.scrollY < hero.offsetHeight - 72);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, pathname]);
  return overHero;
}

function MainLayout() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const hasHero = pathname === "/" || pathname.startsWith("/states/");
  const overHero = useHeaderOverHero(hasHero, pathname);

  // New pages start at the top; back/forward keep the browser's scroll restoration.
  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return (
    <>
      <header className={`topbar ${hasHero ? "topbar-home" : ""} ${overHero ? "is-over-hero" : ""}`}>
        <div className="container topbar-inner">
          <NavLink to="/" className="brand" aria-label="India Tour home" {...kiteLaunchHandlers}>
            {/* CSS shows the colour logo on light headers, the reversed one over photos / in dark mode */}
            <img className="brand-logo brand-logo-color" src="/brand/india-tour-logo-horizontal.svg" alt="" width="146" height="32" />
            <img className="brand-logo brand-logo-reversed" src="/brand/india-tour-logo-horizontal-reversed.svg" alt="" width="146" height="32" />
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
        <Route path="/states/:id" element={<StateDetail />} />
        <Route element={<Contained />}>
          <Route path="/places" element={<Places />} />
          <Route path="/terms" element={<Legal doc="terms" />} />
          <Route path="/privacy" element={<Legal doc="privacy" />} />
          <Route path="*" element={<p className="status">Page not found.</p>} />
        </Route>
      </Route>
    </Routes>
  );
}
