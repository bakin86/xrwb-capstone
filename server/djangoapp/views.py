"""
djangoapp/views.py

View functions for the Cars Dealership capstone project.

All views return JSON responses so they can serve both the React frontend
and any other API consumer.  CORS headers are handled globally by the
corsheaders middleware configured in settings.py.
"""

import logging
import json

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import CarMake, CarModel
from .restapis import (
    get_request,
    post_review,
    analyze_review_sentiments,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _json_body(request):
    """Safely parse the request body as JSON; returns {} on failure."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return {}


def _cors_headers(response):
    """Attach permissive CORS headers to a response (belt-and-suspenders)."""
    response['Access-Control-Allow-Origin']      = '*'
    response['Access-Control-Allow-Credentials'] = 'true'
    response['Access-Control-Allow-Methods']     = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers']     = 'Content-Type, Authorization'
    return response


# ---------------------------------------------------------------------------
# Dealer views
# ---------------------------------------------------------------------------

def get_dealerships(request, state='All'):
    """
    Return a list of all dealerships, optionally filtered by US state name.

    GET /djangoapp/get_dealers/
    GET /djangoapp/get_dealers/<state>/
    """
    endpoint = '/fetchDealers'
    if state != 'All':
        dealers = get_request(endpoint, state=state)
    else:
        dealers = get_request(endpoint)

    if dealers is None:
        return _cors_headers(JsonResponse({'status': 500, 'message': 'Error fetching dealers'}, status=500))

    return _cors_headers(JsonResponse({'status': 200, 'dealers': dealers}))


def get_dealer_details(request, dealer_id):
    """
    Return details for a single dealer identified by *dealer_id*.

    GET /djangoapp/get_dealer/<int:dealer_id>/
    """
    if dealer_id <= 0:
        return _cors_headers(JsonResponse({'status': 400, 'message': 'Invalid dealer id'}, status=400))

    dealer = get_request('/fetchDealer', id=dealer_id)

    if not dealer:
        return _cors_headers(JsonResponse({'status': 404, 'message': 'Dealer not found'}, status=404))

    return _cors_headers(JsonResponse({'status': 200, 'dealer': dealer}))


def get_dealer_reviews(request, dealer_id):
    """
    Return all reviews for a specific dealer, enriched with NLU sentiment.

    GET /djangoapp/reviews/dealer/<int:dealer_id>/
    """
    if dealer_id <= 0:
        return _cors_headers(JsonResponse({'status': 400, 'message': 'Invalid dealer id'}, status=400))

    reviews = get_request('/fetchReviews', id=dealer_id)

    if reviews is None:
        return _cors_headers(JsonResponse({'status': 500, 'message': 'Error fetching reviews'}, status=500))

    # Enrich each review with sentiment analysis
    for review in reviews:
        review_text = review.get('review', '')
        sentiment_result = analyze_review_sentiments(review_text)
        try:
            review['sentiment'] = sentiment_result['sentiment']['document']['label']
        except (KeyError, TypeError):
            review['sentiment'] = 'neutral'

    return _cors_headers(JsonResponse({'status': 200, 'reviews': reviews}))


# ---------------------------------------------------------------------------
# Review submission
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_review(request):
    """
    Add a new dealer review. Requires the user to be authenticated.

    POST /djangoapp/add_review/
    Body (JSON): { name, dealership, review, purchase, purchase_date,
                   car_make, car_model, car_year }
    """
    if not request.user.is_authenticated:
        return _cors_headers(
            JsonResponse({'status': 403, 'message': 'Unauthorized – please log in'}, status=403)
        )

    data = _json_body(request)

    required_fields = ['name', 'dealership', 'review']
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return _cors_headers(
            JsonResponse({'status': 400, 'message': f'Missing fields: {", ".join(missing)}'}, status=400)
        )

    result = post_review(data)

    if result is None:
        return _cors_headers(JsonResponse({'status': 500, 'message': 'Error posting review'}, status=500))

    return _cors_headers(JsonResponse({'status': 200, 'result': result}))


# ---------------------------------------------------------------------------
# Authentication views
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def login_request(request):
    """
    Authenticate a user with username / password credentials.

    POST /djangoapp/login/
    Body (JSON): { "username": "...", "password": "..." }
    """
    data = _json_body(request)
    username = data.get('userName', data.get('username', ''))
    password = data.get('password', '')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        logger.info("User '%s' logged in.", username)
        return _cors_headers(JsonResponse({
            'status':   200,
            'userName': user.username,
            'firstName': user.first_name,
            'lastName':  user.last_name,
            'email':     user.email,
        }))

    return _cors_headers(
        JsonResponse({'status': 401, 'message': 'Invalid username or password'}, status=401)
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def logout_request(request):
    """
    Log out the currently authenticated user.

    GET|POST /djangoapp/logout/
    """
    username = request.user.username if request.user.is_authenticated else 'Anonymous'
    logout(request)
    logger.info("User '%s' logged out.", username)
    return _cors_headers(JsonResponse({'status': 200, 'message': f'Goodbye, {username}!'}))


@csrf_exempt
@require_http_methods(["POST"])
def registration(request):
    """
    Register a new user account.

    POST /djangoapp/register/
    Body (JSON): { username, firstName, lastName, email, password }
    """
    data = _json_body(request)

    username   = data.get('userName',  data.get('username',  '')).strip()
    first_name = data.get('firstName', data.get('first_name', '')).strip()
    last_name  = data.get('lastName',  data.get('last_name',  '')).strip()
    email      = data.get('email',     '').strip()
    password   = data.get('password',  '')

    # --- Basic validation ---
    if not username or not password or not email:
        return _cors_headers(
            JsonResponse({'status': 400, 'message': 'Username, email, and password are required'}, status=400)
        )

    if User.objects.filter(username=username).exists():
        return _cors_headers(
            JsonResponse({'status': 409, 'message': 'Username already taken'}, status=409)
        )

    if User.objects.filter(email=email).exists():
        return _cors_headers(
            JsonResponse({'status': 409, 'message': 'Email already registered'}, status=409)
        )

    # --- Create the user ---
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )
    login(request, user)
    logger.info("New user registered: '%s'", username)

    return _cors_headers(JsonResponse({
        'status':    201,
        'message':   'Registration successful',
        'userName':  user.username,
        'firstName': user.first_name,
        'lastName':  user.last_name,
        'email':     user.email,
    }, status=201))


# ---------------------------------------------------------------------------
# Car inventory views
# ---------------------------------------------------------------------------

def get_cars(request):
    """
    Return all CarMake and CarModel records stored in the Django database.

    GET /djangoapp/get_cars/
    """
    cars = []
    for car_model in CarModel.objects.select_related('car_make').all():
        cars.append({
            'id':          car_model.id,
            'make':        car_model.car_make.name,
            'make_desc':   car_model.car_make.description,
            'model':       car_model.name,
            'type':        car_model.car_type,
            'year':        car_model.year,
            'dealer_id':   car_model.dealer_id,
        })

    return _cors_headers(JsonResponse({'status': 200, 'cars': cars}))
