"""
djangoapp/models.py

Data models for the Cars Dealership capstone project.
CarMake represents a car manufacturer.
CarModel represents individual car models belonging to a manufacturer.
"""

from django.db import models
from django.utils.timezone import now


class CarMake(models.Model):
    """Represents an automobile manufacturer / brand."""

    name = models.CharField(max_length=100, help_text="Brand name, e.g. Toyota")
    description = models.TextField(blank=True, help_text="Short description of the brand")

    class Meta:
        ordering = ['name']
        verbose_name = 'Car Make'
        verbose_name_plural = 'Car Makes'

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """Represents a specific car model produced by a CarMake."""

    # --- Type choices ---
    SEDAN = 'Sedan'
    SUV = 'SUV'
    WAGON = 'Wagon'
    HATCHBACK = 'Hatchback'
    PICKUP = 'Pickup'

    TYPE_CHOICES = [
        (SEDAN, 'Sedan'),
        (SUV, 'SUV'),
        (WAGON, 'Wagon'),
        (HATCHBACK, 'Hatchback'),
        (PICKUP, 'Pickup'),
    ]

    car_make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name='models',
        help_text="Manufacturer this model belongs to"
    )
    name = models.CharField(max_length=100, help_text="Model name, e.g. Camry")
    car_type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        default=SEDAN,
        help_text="Body type"
    )
    year = models.IntegerField(
        default=2023,
        help_text="Model year"
    )
    dealer_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the dealer carrying this model (optional)"
    )

    class Meta:
        ordering = ['car_make', 'name', '-year']
        verbose_name = 'Car Model'
        verbose_name_plural = 'Car Models'

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"
