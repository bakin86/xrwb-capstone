"""
============================================================
Best Cars Dealership — Sentiment Analyzer Microservice
============================================================
A lightweight Flask service that classifies the sentiment of
a review text as positive, negative, or neutral using a
keyword-matching approach.

Endpoint
--------
  POST /analyze
  Body:  { "text": "<review string>" }
  Returns: { "sentiment": "positive"|"negative"|"neutral" }

Running locally
---------------
  pip install -r requirements.txt
  python app.py

Via Docker
----------
  docker build -t sentiment-analyzer .
  docker run -p 5000:5000 sentiment-analyzer
============================================================
"""

from flask import Flask, request, jsonify
import re

app = Flask(__name__)

# ── Sentiment Keyword Lists ───────────────────────────────────────────────────

POSITIVE_WORDS = {
    "great", "excellent", "fantastic", "amazing", "wonderful", "outstanding",
    "superb", "brilliant", "perfect", "awesome", "love", "loved", "best",
    "happy", "pleased", "satisfied", "helpful", "professional", "recommend",
    "smooth", "quick", "fast", "efficient", "friendly", "honest", "fair",
    "transparent", "impressed", "delighted", "enjoy", "enjoyed", "top",
    "exceptional", "incredible", "fabulous", "good", "nice", "positive",
    "memorable", "dream", "thrilled", "enthusiastic", "knowledgeable",
}

NEGATIVE_WORDS = {
    "terrible", "awful", "horrible", "bad", "worst", "poor", "disappointing",
    "disappointed", "disappointed", "rude", "slow", "unprofessional", "dishonest",
    "misleading", "overpriced", "expensive", "problem", "issue", "broken",
    "defective", "waste", "never", "avoid", "scam", "lied", "lie", "hidden",
    "unhelpful", "uninterested", "ignored", "waited", "wait", "long", "delay",
    "frustrated", "angry", "upset", "complaint", "regret", "mistake", "wrong",
}


def clean_text(text: str) -> list[str]:
    """Lowercase, strip punctuation, and tokenise input text into words."""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    return text.split()


def analyze_sentiment(text: str) -> str:
    """
    Returns 'positive', 'negative', or 'neutral' based on keyword counts.
    The label with the higher count wins; ties go to 'neutral'.
    """
    words = clean_text(text)
    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    else:
        return "neutral"


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Analyze the sentiment of a review text.

    Request body (JSON):
        { "text": "The dealership was fantastic and the staff was very helpful!" }

    Response (JSON):
        { "sentiment": "positive" }
    """
    data = request.get_json(silent=True)

    if not data or "text" not in data:
        return jsonify({"error": "Request body must contain a 'text' field."}), 400

    text = str(data["text"]).strip()
    if not text:
        return jsonify({"error": "'text' field must not be empty."}), 400

    sentiment = analyze_sentiment(text)
    return jsonify({"sentiment": sentiment, "text": text[:200]}), 200


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200


# ── Entry Point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    print(f"Sentiment Analyzer running on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
