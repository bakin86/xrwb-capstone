import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

/**
 * Header / Navigation Component
 * Displays the dealership logo, navigation links, and auth controls.
 * Auth state is read from sessionStorage so it persists across page refreshes.
 */
const Header = () => {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  // Sync auth state from sessionStorage on mount and on storage changes
  useEffect(() => {
    const storedUser = sessionStorage.getItem("username");
    if (storedUser) setUsername(storedUser);

    const handleStorage = () => {
      setUsername(sessionStorage.getItem("username"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/djangoapp/logout/", {
        method: "GET",
        credentials: "include",
      });
    } catch (_) {
      // ignore network errors – still clear local session
    }
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    setUsername(null);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__brand">
        <Link to="/" className="header__logo">
          🚗 Best Cars Dealership
        </Link>
      </div>

      <nav className="header__nav" aria-label="Main navigation">
        <Link to="/" className="header__nav-link">
          Home
        </Link>
        <a href="/static/About.html" className="header__nav-link">
          About
        </a>
        <a href="/static/Contact.html" className="header__nav-link">
          Contact
        </a>
      </nav>

      <div className="header__auth">
        {username ? (
          <>
            <span className="header__username">👤 {username}</span>
            <button
              className="header__btn header__btn--logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header__btn header__btn--login">
              Login
            </Link>
            <Link
              to="/register"
              className="header__btn header__btn--register"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
