import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./Login.css";

/**
 * Login Page
 * Submits credentials to /djangoapp/login/ and, on success,
 * stores the username in sessionStorage so other components can detect auth state.
 */
const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/djangoapp/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        // Store auth info in sessionStorage; Header component reads this
        sessionStorage.setItem("username", data.username || credentials.username);
        sessionStorage.setItem("user_id", data.user_id || "");

        // Trigger storage event so Header updates immediately in the same tab
        window.dispatchEvent(new Event("storage"));

        navigate("/");
      } else {
        setError(data.message || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="login">
        <div className="login__card">
          <div className="login__icon">🚗</div>
          <h1 className="login__title">Welcome Back</h1>
          <p className="login__subtitle">Sign in to your account</p>

          {error && <div className="login__error" role="alert">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="login__form" noValidate>
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="login__submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <p className="login__register-link">
            Don't have an account?{" "}
            <Link to="/register">Register here</Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default Login;
