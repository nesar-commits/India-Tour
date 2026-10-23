import { NavLink, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import StateDetail from "./pages/StateDetail.jsx";
import Places from "./pages/Places.jsx";
import Legal from "./pages/Legal.jsx";
import AuthLayout from "./auth/AuthLayout.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import SignupPage from "./auth/SignupPage.jsx";

function MainLayout() {
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
            <NavLink to="/login" className="nav-login">Log in</NavLink>
            <NavLink to="/signup" className="nav-cta">Sign up</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer container">Data served by FastAPI · Built with React</footer>
    </>
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
        <Route path="/places" element={<Places />} />
        <Route path="/terms" element={<Legal doc="terms" />} />
        <Route path="/privacy" element={<Legal doc="privacy" />} />
        <Route path="*" element={<p className="status">Page not found.</p>} />
      </Route>
    </Routes>
  );
}
