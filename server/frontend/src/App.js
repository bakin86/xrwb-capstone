import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Page components
import Dealers from "./components/Dealers/Dealers";
import Dealer from "./components/Dealers/Dealer";
import PostReview from "./components/Dealers/PostReview";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

// Global reset / base styles
import "./App.css";

/**
 * App.js — Root component for Best Cars Dealership
 *
 * Route map:
 *   /              → Dealers list (home)
 *   /login         → Login page
 *   /register      → Registration page
 *   /dealer/:id    → Dealer details + reviews
 *   /dealer/:id/review → Post a review for dealer
 *
 * Static pages (About, Contact) are served directly by Django at /static/.
 * They are linked from the Header component rather than managed by React Router.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Home — Dealer listing */}
        <Route path="/" element={<Dealers />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dealer details */}
        <Route path="/dealer/:id" element={<Dealer />} />

        {/* Post review for a specific dealer */}
        <Route path="/dealer/:id/review" element={<PostReview />} />

        {/* About & Contact — redirect to Django-served static pages */}
        <Route
          path="/about"
          element={<ExternalRedirect to="/static/About.html" />}
        />
        <Route
          path="/contact"
          element={<ExternalRedirect to="/static/Contact.html" />}
        />

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * ExternalRedirect
 * Performs a full browser navigation to a non-React route (e.g., a static HTML file).
 */
function ExternalRedirect({ to }) {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}

export default App;
