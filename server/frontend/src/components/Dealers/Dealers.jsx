import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./Dealers.css";

/**
 * Dealers List Page
 * Fetches all dealers from the Django backend and renders them as cards.
 * Includes a state-filter dropdown so users can narrow results.
 * A "Review Dealer" button is shown only to authenticated users.
 */
const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");

  // ---- Fetch dealers on mount ------------------------------------------------
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/djangoapp/get_dealers/");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();

        const dealerList = data.dealers || [];
        setDealers(dealerList);
        setFilteredDealers(dealerList);

        // Build unique state list for the filter dropdown
        const uniqueStates = [
          "All",
          ...new Set(dealerList.map((d) => d.state).filter(Boolean)),
        ].sort();
        setStates(uniqueStates);
      } catch (err) {
        console.error("Failed to fetch dealers:", err);
        setError("Unable to load dealers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  // ---- Filter dealers when dropdown changes ----------------------------------
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    if (state === "All") {
      setFilteredDealers(dealers);
    } else {
      setFilteredDealers(dealers.filter((d) => d.state === state));
    }
  };

  // ---- Render ----------------------------------------------------------------
  if (loading) {
    return (
      <>
        <Header />
        <div className="dealers__loading">
          <div className="spinner" />
          <p>Loading dealers…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="dealers__error">
          <p>⚠️ {error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="dealers">
        <section className="dealers__hero">
          <h1>Find a Dealer Near You</h1>
          <p>Browse our network of trusted dealerships across the country.</p>
        </section>

        {/* State filter */}
        <div className="dealers__filters">
          <label htmlFor="state-filter" className="dealers__filter-label">
            Filter by State:
          </label>
          <select
            id="state-filter"
            className="dealers__filter-select"
            value={selectedState}
            onChange={handleStateChange}
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <span className="dealers__count">
            Showing {filteredDealers.length} dealer
            {filteredDealers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Dealers table */}
        {filteredDealers.length === 0 ? (
          <p className="dealers__empty">No dealers found for this state.</p>
        ) : (
          <div className="dealers__table-wrapper">
            <table className="dealers__table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dealer Name</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Address</th>
                  {username && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map((dealer, idx) => (
                  <tr key={dealer.id || idx}>
                    <td>{idx + 1}</td>
                    <td className="dealers__name">{dealer.full_name}</td>
                    <td>{dealer.city}</td>
                    <td>{dealer.state}</td>
                    <td>{dealer.address}</td>
                    {username && (
                      <td>
                        <button
                          className="dealers__review-btn"
                          onClick={() => navigate(`/dealer/${dealer.id}`)}
                        >
                          📝 Review Dealer
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default Dealers;
