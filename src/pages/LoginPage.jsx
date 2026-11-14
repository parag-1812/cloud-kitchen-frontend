import { useState } from "react";
import { login, signup } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

const DEMO_USERS = ["customer", "kitchen", "admin"];

const ROLES = [
  { value: "USER", label: "Customer" },
  { value: "KITCHEN", label: "Kitchen / Restaurant" },
  { value: "SUPPLIER", label: "Ingredient Supplier" },
];

function routeForRole(role, navigate) {
  if (role === "USER") navigate("/");
  else if (role === "KITCHEN") navigate("/kitchen");
  else if (role === "SUPPLIER") navigate("/supplier");
  else if (role === "ADMIN") navigate("/admin");
}

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(username, password, role);
      }
      const data = await login(username, password);
      localStorage.setItem("token", data.token);

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      routeForRole(payload.role, navigate);
    } catch (err) {
      setError(isSignup ? "Could not create that account (username may be taken)." : "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo(name) {
    setUsername(name);
    setPassword("password123");
    setError("");
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="auth-brand">
          <span className="auth-logo"><Logo size={40} /></span>
          <span className="kicker">Crave</span>
        </div>

        <h1 className="auth-title">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-sub">
          {isSignup
            ? "Join as a customer, a kitchen, or an ingredient supplier."
            : "Sign in to order food made exactly the way you imagine it."}
        </p>

        <div className="field">
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isSignup ? (
          <div className="field">
            <label htmlFor="signup-role">I am a…</label>
            <select
              id="signup-role"
              className="ai-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        ) : null}

        <button type="submit" className="btn primary auth-btn" disabled={isLoading}>
          {isLoading ? (isSignup ? "Creating…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
        </button>

        <p className="auth-toggle">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" className="auth-link" onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="auth-demo">
          <span className="auth-demo-label">Demo logins · password <code>password123</code></span>
          <div className="catalog-row">
            {DEMO_USERS.map((name) => (
              <button
                type="button"
                key={name}
                className="pill ai-example"
                onClick={() => fillDemo(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
