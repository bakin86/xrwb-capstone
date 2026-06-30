"""
djangoapp/apps.py

App configuration for djangoapp.
"""

from django.apps import AppConfig


class DjangoappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'djangoapp'
    verbose_name = 'Cars Dealership App'
