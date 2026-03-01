import { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login(username, password);

      localStorage.setItem("token", data.token);

      const payload = JSON.parse(
        atob(data.token.split(".")[1])
      );

      localStorage.setItem("role", payload.role);

      if (payload.role === "USER") {
        navigate("/");
      } else if (payload.role === "KITCHEN") {
        navigate("/kitchen");
      } else if (payload.role === "ADMIN") {
         navigate("/admin");
      }

    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginPage;