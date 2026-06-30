import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./Dealer.css";

/**
 * Maps a sentiment label returned by the analyzer service
 * to an emoji badge for quick visual scanning.
 */
const sentimentEmoji = (sentiment) => {
  switch ((sentiment || "").toLowerCase()) {
    case "positive":
      return { icon: "😊", label: "Positive", cls: "sentiment--positive" };
    case "negative":
      return { icon: "😞", label: "Negative", cls: "sentiment--negative" };
    default:
      return { icon: "😐", label: "Neutral", cls: "sentiment--neutral" };
  }
};

/**
 * Dealer Details Page
 * Displays dealer info at the top and a list of all reviews for that dealer.
 * Each review includes a sentiment badge fetched from the Flask analyzer.
 */
const Dealer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = sessionStorage.getItem("username");

  // ---- Fetch dealer info and reviews in parallel ----------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [dealerRes, reviewsRes] = await Promise.all([
          fetch(`/djangoapp/get_dealer/${id}/`),
          fetch(`/djangoapp/reviews/dealer/${id}/`),
        ]);

        if (!dealerRes.ok) throw new Error("Could not load dealer info.");
        if (!reviewsRes.ok) throw new Error("Could not load reviews.");

        const dealerData = await dealerRes.json();
        const reviewsData = await reviewsRes.json();

        setDealer(dealerData.dealer || dealerData);
        setReviews(reviewsData.reviews || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ---- Loading / error guards -----------------------------------------------
  if (loading) {
    return (
      <>
        <Header />
        <div className="dealer-detail__loading">
          <div className="spinner" />
          <p>Loading dealer info…</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="dealer-detail__error">
          <p>⚠️ {error}</p>
          <button onClick={() => navigate("/")}>← Back to Dealers</button>
        </div>
      </>
    );
  }

  // ---- Render ---------------------------------------------------------------
  return (
    <>
      <Header />
      <main className="dealer-detail">
        {/* Dealer info card */}
        {dealer && (
          <section className="dealer-detail__info">
            <h1 className="dealer-detail__name">{dealer.full_name}</h1>
            <div className="dealer-detail__meta">
              <span>📍 {dealer.city}, {dealer.state} {dealer.zip}</span>
              <span>🏠 {dealer.address}</span>
            </div>
            {username && (
              <Link
                to={`/dealer/${id}/review`}
                className="dealer-detail__post-btn"
              >
                ✏️ Post a Review
              </Link>
            )}
          </section>
        )}

        {/* Reviews section */}
        <section className="dealer-detail__reviews">
          <h2>Customer Reviews ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="dealer-detail__no-reviews">
              No reviews yet. {username ? "Be the first to review!" : "Log in to post a review."}
            </p>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review, idx) => {
                const sentiment = sentimentEmoji(review.sentiment);
                return (
                  <article key={review.id || idx} className="review-card">
                    <header className="review-card__header">
                      <span className="review-card__author">{review.name}</span>
                      <span className={`review-card__sentiment ${sentiment.cls}`}>
                        {sentiment.icon} {sentiment.label}
                      </span>
                    </header>

                    <p className="review-card__text">{review.review}</p>

                    <footer className="review-card__footer">
                      {review.car_make && (
                        <span>
                          🚗 {review.car_year} {review.car_make} {review.car_model}
                        </span>
                      )}
                      {review.purchase_date && (
                        <span>📅 Purchased: {review.purchase_date}</span>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <Link to="/" className="dealer-detail__back-link">
          ← All Dealers
        </Link>
      </main>
    </>
  );
};

export default Dealer;
