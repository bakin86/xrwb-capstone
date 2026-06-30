import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import "./PostReview.css";

/**
 * Catalogue of car makes and their available models.
 * In a production app these would be fetched from the backend.
 */
const CAR_CATALOGUE = {
  Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "4Runner"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "Ridgeline"],
  Ford: ["Mustang", "F-150", "Explorer", "Escape", "Edge", "Bronco"],
  Chevrolet: ["Silverado", "Equinox", "Malibu", "Traverse", "Colorado", "Camaro"],
  BMW: ["3 Series", "5 Series", "X3", "X5", "7 Series", "M3"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  Nissan: ["Altima", "Sentra", "Rogue", "Murano", "Pathfinder", "Frontier"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Ioniq 5"],
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

/**
 * Post Review Form
 * Allows an authenticated user to submit a review for a dealer.
 * Submits a POST request to /djangoapp/add_review/.
 */
const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    purchaseDate: "",
    carMake: "",
    carModel: "",
    carYear: String(CURRENT_YEAR),
    review: "",
    anotherCar: "no",
  });

  const [models, setModels] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const username = sessionStorage.getItem("username");

  // Redirect unauthenticated users
  useEffect(() => {
    if (!username) {
      navigate("/login");
    }
  }, [username, navigate]);

  // Populate model list when make changes
  useEffect(() => {
    if (formData.carMake) {
      setModels(CAR_CATALOGUE[formData.carMake] || []);
      setFormData((prev) => ({ ...prev, carModel: "" }));
    } else {
      setModels([]);
    }
  }, [formData.carMake]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!formData.review.trim()) {
      setError("Please enter your review text.");
      setSubmitting(false);
      return;
    }

    const payload = {
      name: username,
      dealership: parseInt(id, 10),
      review: formData.review,
      purchase: formData.purchaseDate !== "",
      purchase_date: formData.purchaseDate,
      car_make: formData.carMake,
      car_model: formData.carModel,
      car_year: formData.carYear,
      another_car: formData.anotherCar === "yes",
    };

    try {
      const response = await fetch("/djangoapp/add_review/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error: ${response.status}`);
      }

      setSuccess(true);
      setTimeout(() => navigate(`/dealer/${id}`), 2000);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <Header />
        <div className="post-review__success">
          <div className="success-icon">✅</div>
          <h2>Review Submitted!</h2>
          <p>Thank you for your feedback. Redirecting…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="post-review">
        <div className="post-review__card">
          <h1 className="post-review__title">Post a Review</h1>
          <p className="post-review__subtitle">
            Dealer ID: <strong>{id}</strong> · Reviewing as{" "}
            <strong>{username}</strong>
          </p>

          {error && <div className="post-review__error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="post-review__form" noValidate>
            {/* Purchase Date */}
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Car Make */}
            <div className="form-group">
              <label htmlFor="carMake">Car Make</label>
              <select
                id="carMake"
                name="carMake"
                value={formData.carMake}
                onChange={handleChange}
              >
                <option value="">— Select Make —</option>
                {Object.keys(CAR_CATALOGUE).map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Car Model */}
            <div className="form-group">
              <label htmlFor="carModel">Car Model</label>
              <select
                id="carModel"
                name="carModel"
                value={formData.carModel}
                onChange={handleChange}
                disabled={!formData.carMake}
              >
                <option value="">
                  {formData.carMake ? "— Select Model —" : "Select a make first"}
                </option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Year */}
            <div className="form-group">
              <label htmlFor="carYear">Purchase Year</label>
              <select
                id="carYear"
                name="carYear"
                value={formData.carYear}
                onChange={handleChange}
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Review Textarea */}
            <div className="form-group">
              <label htmlFor="review">
                Your Review <span className="required">*</span>
              </label>
              <textarea
                id="review"
                name="review"
                rows={5}
                placeholder="Share your experience with this dealership…"
                value={formData.review}
                onChange={handleChange}
                required
              />
            </div>

            {/* Another Car (Yes/No) */}
            <fieldset className="form-group form-group--radio">
              <legend>Would you buy another car here?</legend>
              <label className="radio-label">
                <input
                  type="radio"
                  name="anotherCar"
                  value="yes"
                  checked={formData.anotherCar === "yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="anotherCar"
                  value="no"
                  checked={formData.anotherCar === "no"}
                  onChange={handleChange}
                />
                No
              </label>
            </fieldset>

            <button
              type="submit"
              className="post-review__submit"
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default PostReview;
