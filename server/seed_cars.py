import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings')
django.setup()

from djangoapp.models import CarMake, CarModel

# Clear existing
CarModel.objects.all().delete()
CarMake.objects.all().delete()

makes = {
    'Toyota': {
        'desc': 'Japanese multinational automotive manufacturer.',
        'models': [
            {'name': 'Camry', 'type': 'Sedan', 'year': 2023},
            {'name': 'Corolla', 'type': 'Sedan', 'year': 2022},
            {'name': 'RAV4', 'type': 'SUV', 'year': 2023},
        ]
    },
    'Honda': {
        'desc': 'Japanese public multinational conglomerate manufacturer of automobiles.',
        'models': [
            {'name': 'Accord', 'type': 'Sedan', 'year': 2022},
            {'name': 'Civic', 'type': 'Sedan', 'year': 2023},
            {'name': 'CR-V', 'type': 'SUV', 'year': 2023},
        ]
    },
    'Ford': {
        'desc': 'American multinational automobile manufacturer.',
        'models': [
            {'name': 'Explorer', 'type': 'SUV', 'year': 2023},
            {'name': 'Mustang', 'type': 'Sedan', 'year': 2022},
            {'name': 'F-150', 'type': 'Pickup', 'year': 2023},
        ]
    }
}

for make_name, data in makes.items():
    make = CarMake.objects.create(name=make_name, description=data['desc'])
    for m in data['models']:
        CarModel.objects.create(
            car_make=make,
            name=m['name'],
            car_type=m['type'],
            year=m['year']
        )

print("Cars seeded successfully!")
