import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/**
 * Application entry point.
 * React 18 createRoot API is used for concurrent mode support.
 */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
