"""
djangoapp/restapis.py

Helper functions that communicate with the Node.js dealership microservice
(default: http://localhost:3000) and the Watson NLU sentiment service.

All functions return Python dicts / lists that can be serialised directly
to JSON by Django views.
"""

import logging
import json

import requests

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
backend_url = 'http://localhost:3000'
sentiment_analyzer_url = 'http://localhost:5050/analyze'   # Watson NLU proxy


# ---------------------------------------------------------------------------
# Generic GET helper
# ---------------------------------------------------------------------------
def get_request(endpoint, **kwargs):
    """
    Send an HTTP GET request to the Node.js backend.

    Parameters
    ----------
    endpoint : str
        Path relative to ``backend_url``, e.g. ``'/fetchDealers'``.
    **kwargs
        Optional query-string parameters forwarded to ``requests.get``.

    Returns
    -------
    dict | list | None
        Parsed JSON response, or ``None`` on error.
    """
    params = ""
    if kwargs:
        params = "&".join(f"{k}={v}" for k, v in kwargs.items())

    url = f"{backend_url}{endpoint}"
    if params:
        url = f"{url}?{params}"

    logger.info("GET %s", url)
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        logger.warning("Node.js backend unreachable at %s – returning mock data.", url)
        return _mock_response(endpoint, **kwargs)
    except requests.exceptions.HTTPError as exc:
        logger.error("HTTP error from backend: %s", exc)
        return None
    except requests.exceptions.RequestException as exc:
        logger.error("Request failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# POST helper
# ---------------------------------------------------------------------------
def post_review(data_dict):
    """
    POST a new dealer review to the Node.js backend.

    Parameters
    ----------
    data_dict : dict
        Review payload containing keys: ``name``, ``dealership``,
        ``review``, ``purchase``, ``purchase_date``, ``car_make``,
        ``car_model``, ``car_year``.

    Returns
    -------
    dict | None
        Response from the backend, or ``None`` on error.
    """
    url = f"{backend_url}/insertReview"
    logger.info("POST %s  payload=%s", url, data_dict)
    try:
        response = requests.post(
            url,
            json=data_dict,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        logger.warning("Cannot reach Node backend for POST – returning mock ack.")
        return {"status": "ok", "message": "Review stored (mock)"}
    except requests.exceptions.RequestException as exc:
        logger.error("post_review failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Sentiment analysis
# ---------------------------------------------------------------------------
def analyze_review_sentiments(text):
    """
    Calls a Watson NLU-compatible sentiment endpoint.

    Parameters
    ----------
    text : str
        The review text to analyse.

    Returns
    -------
    dict
        A dict with at least ``{"sentiment": {"document": {"label": ..., "score": ...}}}``.
        Falls back to a simple keyword-based mock when the service is unavailable.
    """
    params = {
        "text": text,
        "version": "2022-04-07",
        "features": "sentiment",
        "return_analyzed_text": True
    }
    try:
        response = requests.get(
            sentiment_analyzer_url,
            params=params,
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as exc:
        logger.warning("Sentiment service unavailable (%s) – using keyword mock.", exc)
        return _mock_sentiment(text)


# ---------------------------------------------------------------------------
# Mock helpers (used when microservices are not running)
# ---------------------------------------------------------------------------
_MOCK_DEALERS = [
    {"id": 1, "full_name": "Kansas Best Cars",  "city": "Wichita",      "address": "123 Main St",    "zip": "67201", "state": "Kansas",     "st": "KS", "lat": 37.69,  "long": -97.33},
    {"id": 2, "full_name": "Sunflower Motors",   "city": "Topeka",       "address": "456 Oak Ave",    "zip": "66603", "state": "Kansas",     "st": "KS", "lat": 39.05,  "long": -95.68},
    {"id": 3, "full_name": "Lone Star Auto",     "city": "Dallas",       "address": "789 Elm Blvd",   "zip": "75201", "state": "Texas",      "st": "TX", "lat": 32.78,  "long": -96.80},
    {"id": 4, "full_name": "Golden Gate Wheels", "city": "San Francisco","address": "101 Market St",  "zip": "94105", "state": "California", "st": "CA", "lat": 37.77,  "long": -122.42},
    {"id": 5, "full_name": "Empire State Autos", "city": "New York",     "address": "500 Broadway",   "zip": "10012", "state": "New York",   "st": "NY", "lat": 40.71,  "long": -74.01},
]

_MOCK_REVIEWS = {
    1: [
        {"id": 101, "name": "Alice Johnson", "dealership": 1, "review": "Great experience! Very professional staff.", "purchase": True,  "purchase_date": "2024-01-15", "car_make": "Toyota",  "car_model": "Camry",    "car_year": 2023, "sentiment": "positive"},
        {"id": 102, "name": "Bob Smith",     "dealership": 1, "review": "Good selection of vehicles, fair prices.", "purchase": False, "purchase_date": "2024-02-20", "car_make": "Honda",   "car_model": "Accord",   "car_year": 2022, "sentiment": "positive"},
    ],
    2: [
        {"id": 103, "name": "Carol Davis",   "dealership": 2, "review": "Average service, long wait times.",        "purchase": True,  "purchase_date": "2024-03-05", "car_make": "Ford",    "car_model": "Explorer", "car_year": 2023, "sentiment": "neutral"},
    ],
}


def _mock_response(endpoint, **kwargs):
    """Return plausible mock data when the Node backend is unreachable."""
    if '/fetchDealers' in endpoint or '/fetchdealer' in endpoint.lower():
        dealer_id = kwargs.get('id')
        state     = kwargs.get('state')
        if dealer_id:
            matches = [d for d in _MOCK_DEALERS if d['id'] == int(dealer_id)]
            return matches[0] if matches else {}
        if state and state != 'All':
            return [d for d in _MOCK_DEALERS if d['state'].lower() == state.lower() or d['st'].lower() == state.lower()]
        return _MOCK_DEALERS

    if '/fetchReviews' in endpoint:
        dealer_id = kwargs.get('id')
        if dealer_id:
            return _MOCK_REVIEWS.get(int(dealer_id), [])
        return []

    return {}


def _mock_sentiment(text):
    """Keyword-based sentiment mock that returns a Watson-compatible dict."""
    positive_words = {'great', 'excellent', 'love', 'amazing', 'fantastic', 'good', 'best', 'wonderful', 'happy', 'satisfied'}
    negative_words = {'bad', 'terrible', 'awful', 'worst', 'horrible', 'poor', 'disappointed', 'rude', 'slow', 'broken'}

    tokens = set(text.lower().split())
    pos_count = len(tokens & positive_words)
    neg_count = len(tokens & negative_words)

    if pos_count > neg_count:
        label, score = 'positive', round(0.5 + pos_count * 0.1, 2)
    elif neg_count > pos_count:
        label, score = 'negative', round(-(0.5 + neg_count * 0.1), 2)
    else:
        label, score = 'neutral', 0.0

    score = max(-1.0, min(1.0, score))

    return {
        "usage": {"text_units": 1, "text_characters": len(text)},
        "sentiment": {
            "document": {
                "label": label,
                "score": score
            }
        },
        "analyzed_text": text,
        "source": "mock"
    }
