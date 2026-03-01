import { Link, Route, Routes, useLocation, Navigate, useNavigate } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import KitchenPage from "./pages/KitchenPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import AdminPage from "./pages/AdminPage";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive =
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      {children}
    </Link>
  );
}

function AppLayout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <header className="topbar">
        <div>
          <p className="kicker">Order Engine</p>
          <h1>Cloud Kitchen Control Center</h1>
        </div>

        <nav className="nav-tabs">
          {role === "USER" && <NavLink to="/">Customer</NavLink>}
          {role === "KITCHEN" && <NavLink to="/kitchen">Kitchen</NavLink>}
          {role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="main-content">
        <p className="intro">
          Create, track, and process orders using your Spring backend APIs.
        </p>
        {children}
      </main>

      <footer className="footer-note">
        Frontend secured with JWT authentication.
      </footer>
    </div>
  );
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRole="USER">
            <AppLayout>
              <CustomerPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRole="KITCHEN">
            <AppLayout>
              <KitchenPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route
        path="*"
        element={token ? <Navigate to="/" /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;