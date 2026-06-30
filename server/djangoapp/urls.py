"""
djangoapp/urls.py

URL patterns for all djangoapp endpoints.
These are mounted under /djangoapp/ by the root djangoproj/urls.py.
"""

from django.urls import path

from . import views

app_name = 'djangoapp'

urlpatterns = [
    # ------------------------------------------------------------------
    # Dealers
    # ------------------------------------------------------------------
    # All dealers
    path('get_dealers/', views.get_dealerships, name='get_dealers'),
    # Dealers filtered by US state name (e.g. /djangoapp/get_dealers/Kansas/)
    path('get_dealers/<str:state>/', views.get_dealerships, name='get_dealers_by_state'),
    # Single dealer detail
    path('get_dealer/<int:dealer_id>/', views.get_dealer_details, name='get_dealer_details'),

    # ------------------------------------------------------------------
    # Reviews
    # ------------------------------------------------------------------
    path('reviews/dealer/<int:dealer_id>/', views.get_dealer_reviews, name='get_dealer_reviews'),
    path('add_review/', views.add_review, name='add_review'),

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------
    path('login/',    views.login_request,  name='login'),
    path('logout/',   views.logout_request, name='logout'),
    path('register/', views.registration,   name='register'),

    # ------------------------------------------------------------------
    # Cars inventory
    # ------------------------------------------------------------------
    path('get_cars/', views.get_cars, name='get_cars'),
]
