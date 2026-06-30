"""
djangoapp/admin.py

Registers CarMake and CarModel with the Django admin site.
CarModel is shown as a tabular inline inside CarMake for
convenient one-screen editing.
"""

from django.contrib import admin

from .models import CarMake, CarModel


# ---------------------------------------------------------------------------
# Inline configuration
# ---------------------------------------------------------------------------
class CarModelInline(admin.TabularInline):
    """Shows CarModel rows inline within the CarMake admin page."""

    model = CarModel
    extra = 1                 # number of blank rows shown by default
    fields = ('name', 'car_type', 'year', 'dealer_id')
    show_change_link = True


# ---------------------------------------------------------------------------
# CarMake admin
# ---------------------------------------------------------------------------
@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    """Admin panel for car manufacturers."""

    list_display  = ('name', 'description')
    search_fields = ('name',)
    ordering      = ('name',)
    inlines       = [CarModelInline]


# ---------------------------------------------------------------------------
# CarModel admin (standalone view)
# ---------------------------------------------------------------------------
@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    """Admin panel for individual car models."""

    list_display   = ('name', 'car_make', 'car_type', 'year', 'dealer_id')
    list_filter    = ('car_type', 'year', 'car_make')
    search_fields  = ('name', 'car_make__name')
    ordering       = ('car_make', 'name')
    list_per_page  = 25
