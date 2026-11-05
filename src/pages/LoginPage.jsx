import { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";

const DEMO_USERS = ["customer", "kitchen", "admin"];

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.token);

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      if (payload.role === "USER") navigate("/");
      else if (payload.role === "KITCHEN") navigate("/kitchen");
      else if (payload.role === "ADMIN") navigate("/admin");
    } catch (err) {
      setError("Invalid username or password.");
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
          <span className="auth-logo">🍳</span>
          <span className="kicker">Cloud Kitchen</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to order food made exactly the way you imagine it.</p>

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

        <button type="submit" className="btn primary auth-btn" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

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
