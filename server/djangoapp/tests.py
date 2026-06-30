from django.test import TestCase
from .models import CarMake, CarModel

class CarModelTestCase(TestCase):
    def setUp(self):
        self.make = CarMake.objects.create(name="Ford", description="Ford Motor Company")
        self.model = CarModel.objects.create(
            car_make=self.make,
            name="Mustang",
            car_type=CarModel.SEDAN,
            year=2023
        )

    def test_carmake_creation(self):
        """Test that CarMake is created correctly."""
        self.assertEqual(self.make.name, "Ford")
        self.assertEqual(str(self.make), "Ford")

    def test_carmodel_creation(self):
        """Test that CarModel is created correctly."""
        self.assertEqual(self.model.name, "Mustang")
        self.assertEqual(self.model.car_make, self.make)
        self.assertEqual(str(self.model), "Ford Mustang (2023)")
