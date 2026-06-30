/**
 * ============================================================
 * Best Cars Dealership — Node.js / Express Dealer Microservice
 * ============================================================
 * Provides a REST API for dealer and review data stored in MongoDB.
 * The service seeds the database with sample data if the collections
 * are empty so the app works out-of-the-box.
 *
 * Port: 3000 (configurable via PORT env variable)
 * Mongo: mongodb://localhost:27017/dealershipsDB (configurable via MONGO_URL)
 *
 * Endpoints
 * ---------
 *  GET  /fetchDealers          – all dealers
 *  GET  /fetchDealer/:id       – single dealer by id
 *  GET  /fetchDealers/:state   – dealers filtered by state abbreviation
 *  GET  /fetchReviews/:id      – reviews for a dealer
 *  POST /insert_review         – add a new review
 * ============================================================
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// ── Configuration ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/dealershipsDB";

// ── App Setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`✅ Connected to MongoDB at ${MONGO_URL}`);
    seedDatabase(); // seed if empty
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ── Schemas & Models ──────────────────────────────────────────────────────────

/**
 * Dealer Schema
 * Mirrors the DealerProfile model in the Django backend.
 */
const dealerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    full_name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    zip: { type: String, trim: true },
    state: { type: String, required: true, trim: true },  // full state name
    st: { type: String, trim: true },                     // 2-letter abbreviation
    lat: { type: Number },
    long: { type: Number },
  },
  { collection: "dealers" }
);

/**
 * Review Schema
 * Stores customer reviews along with the sentiment label computed by
 * the Flask sentiment analyzer service.
 */
const reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },       // reviewer name
    dealership: { type: Number, required: true },              // dealer id FK
    review: { type: String, required: true, trim: true },
    purchase: { type: Boolean, default: false },               // did they buy?
    another_car: { type: Boolean, default: false },            // would buy again?
    car_make: { type: String, trim: true },
    car_model: { type: String, trim: true },
    car_year: { type: String, trim: true },
    sentiment: { type: String, enum: ["positive", "negative", "neutral"], default: "neutral" },
    purchase_date: { type: String, trim: true },               // ISO date string
  },
  {
    collection: "reviews",
    timestamps: true, // adds createdAt / updatedAt
  }
);

const Dealer = mongoose.model("Dealer", dealerSchema);
const Review = mongoose.model("Review", reviewSchema);

// ── Seed Data ────────────────────────────────────────────────────────────────

/**
 * Seeds initial dealer and review documents if the collections are empty.
 * The seed includes 5 dealers (2 in Kansas as required) and 5+ reviews.
 */
async function seedDatabase() {
  try {
    const dealerCount = await Dealer.countDocuments();
    if (dealerCount === 0) {
      const seedDealers = [
        {
          id: 1,
          full_name: "Sunrise Motors Wichita",
          city: "Wichita",
          address: "1234 Main St",
          zip: "67202",
          state: "Kansas",
          st: "KS",
          lat: 37.6872,
          long: -97.3301,
        },
        {
          id: 2,
          full_name: "Prairie Cars Topeka",
          city: "Topeka",
          address: "5678 Commerce Ave",
          zip: "66603",
          state: "Kansas",
          st: "KS",
          lat: 39.0483,
          long: -95.6780,
        },
        {
          id: 3,
          full_name: "Gateway Auto Chicago",
          city: "Chicago",
          address: "900 Michigan Ave",
          zip: "60611",
          state: "Illinois",
          st: "IL",
          lat: 41.8781,
          long: -87.6298,
        },
        {
          id: 4,
          full_name: "Golden State Motors Los Angeles",
          city: "Los Angeles",
          address: "3300 Wilshire Blvd",
          zip: "90010",
          state: "California",
          st: "CA",
          lat: 34.0522,
          long: -118.2437,
        },
        {
          id: 5,
          full_name: "Capital City Cars Austin",
          city: "Austin",
          address: "777 Congress Ave",
          zip: "78701",
          state: "Texas",
          st: "TX",
          lat: 30.2672,
          long: -97.7431,
        },
      ];
      await Dealer.insertMany(seedDealers);
      console.log(`🌱 Seeded ${seedDealers.length} dealers.`);
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      const seedReviews = [
        {
          id: 1,
          name: "Alice Johnson",
          dealership: 1,
          review: "Fantastic experience! The staff was incredibly helpful and I got a great deal on my new Camry. Would definitely recommend to friends and family.",
          purchase: true,
          another_car: true,
          car_make: "Toyota",
          car_model: "Camry",
          car_year: "2023",
          sentiment: "positive",
          purchase_date: "2023-09-15",
        },
        {
          id: 2,
          name: "Bob Martinez",
          dealership: 1,
          review: "Decent selection but the wait time was too long. The salesperson was helpful once we finally got assistance.",
          purchase: true,
          another_car: false,
          car_make: "Honda",
          car_model: "CR-V",
          car_year: "2022",
          sentiment: "neutral",
          purchase_date: "2023-07-22",
        },
        {
          id: 3,
          name: "Carol White",
          dealership: 2,
          review: "Prairie Cars gave me an outstanding deal on a Ford F-150. The financing team was transparent and professional throughout the whole process.",
          purchase: true,
          another_car: true,
          car_make: "Ford",
          car_model: "F-150",
          car_year: "2024",
          sentiment: "positive",
          purchase_date: "2024-01-08",
        },
        {
          id: 4,
          name: "David Kim",
          dealership: 3,
          review: "Very disappointed. The car I was shown online was not available, and the staff seemed uninterested in helping me find an alternative.",
          purchase: false,
          another_car: false,
          car_make: "",
          car_model: "",
          car_year: "",
          sentiment: "negative",
          purchase_date: "",
        },
        {
          id: 5,
          name: "Emily Chen",
          dealership: 4,
          review: "Golden State Motors has an amazing inventory. I found my dream Tesla Model Y and the test drive was memorable. The team made the whole process smooth and enjoyable!",
          purchase: true,
          another_car: true,
          car_make: "Tesla",
          car_model: "Model Y",
          car_year: "2024",
          sentiment: "positive",
          purchase_date: "2024-03-20",
        },
        {
          id: 6,
          name: "Frank Rivera",
          dealership: 5,
          review: "Good dealership overall. The price negotiation was fair and the paperwork was handled quickly. The dealership could improve their lounge area though.",
          purchase: true,
          another_car: true,
          car_make: "Chevrolet",
          car_model: "Silverado",
          car_year: "2023",
          sentiment: "positive",
          purchase_date: "2023-11-30",
        },
      ];
      await Review.insertMany(seedReviews);
      console.log(`🌱 Seeded ${seedReviews.length} reviews.`);
    }
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
  }
}

// ── Route Helpers ─────────────────────────────────────────────────────────────

/** Wraps async route handlers to forward errors to Express error middleware. */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /fetchDealers
 * Returns all dealers in the database.
 */
app.get(
  "/fetchDealers",
  asyncHandler(async (req, res) => {
    const dealers = await Dealer.find({}, { _id: 0, __v: 0 }).sort({ id: 1 });
    res.json({ status: 200, dealers });
  })
);

/**
 * GET /fetchDealer/:id
 * Returns a single dealer by numeric id.
 */
app.get(
  "/fetchDealer/:id",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ status: 400, message: "Invalid dealer id." });
    }

    const dealer = await Dealer.findOne({ id }, { _id: 0, __v: 0 });
    if (!dealer) {
      return res.status(404).json({ status: 404, message: "Dealer not found." });
    }

    res.json({ status: 200, dealer });
  })
);

/**
 * GET /fetchDealers/:state
 * Returns all dealers in the given state.
 * Accepts either full state name ("Kansas") or 2-letter abbreviation ("KS"),
 * matching case-insensitively.
 */
app.get(
  "/fetchDealers/:state",
  asyncHandler(async (req, res) => {
    const { state } = req.params;
    const regex = new RegExp(`^${state}$`, "i");

    const dealers = await Dealer.find(
      { $or: [{ state: regex }, { st: regex }] },
      { _id: 0, __v: 0 }
    ).sort({ id: 1 });

    res.json({ status: 200, dealers });
  })
);

/**
 * GET /fetchReviews/:id
 * Returns all reviews for a specific dealer, sorted newest first.
 */
app.get(
  "/fetchReviews/:id",
  asyncHandler(async (req, res) => {
    const dealership = parseInt(req.params.id, 10);
    if (isNaN(dealership)) {
      return res.status(400).json({ status: 400, message: "Invalid dealer id." });
    }

    const reviews = await Review.find(
      { dealership },
      { _id: 0, __v: 0 }
    ).sort({ createdAt: -1 });

    res.json({ status: 200, reviews });
  })
);

/**
 * POST /insert_review
 * Inserts a new review document.
 *
 * Expected JSON body:
 * {
 *   name, dealership, review, purchase, purchase_date,
 *   car_make, car_model, car_year, another_car, sentiment
 * }
 */
app.post(
  "/insert_review",
  asyncHandler(async (req, res) => {
    const {
      name,
      dealership,
      review: reviewText,
      purchase,
      purchase_date,
      car_make,
      car_model,
      car_year,
      another_car,
      sentiment = "neutral",
    } = req.body;

    // Minimal validation
    if (!name || !dealership || !reviewText) {
      return res.status(400).json({
        status: 400,
        message: "name, dealership, and review fields are required.",
      });
    }

    // Auto-increment id based on the current max
    const lastReview = await Review.findOne({}).sort({ id: -1 });
    const nextId = lastReview ? lastReview.id + 1 : 1;

    const newReview = new Review({
      id: nextId,
      name,
      dealership: parseInt(dealership, 10),
      review: reviewText,
      purchase: Boolean(purchase),
      purchase_date: purchase_date || "",
      car_make: car_make || "",
      car_model: car_model || "",
      car_year: car_year || "",
      another_car: Boolean(another_car),
      sentiment,
    });

    await newReview.save();

    const saved = newReview.toObject();
    delete saved._id;
    delete saved.__v;

    res.status(201).json({ status: 201, review: saved });
  })
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 404, message: `Route ${req.path} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ status: 500, message: "Internal server error." });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚗 Dealer microservice running on http://localhost:${PORT}`);
});

module.exports = app; // export for testing
