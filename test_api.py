import os
import django
import sys

# Setup Django environment
sys.path.append('/home/ra/Desktop/Django/apiFacturacion')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from billing.models import Customer
from core.utils.response import CustomRenderer

try:
    c = Customer.objects.create(
        first_name='Juan',
        last_name='Perez',
        email='juan@example.com',
        document_number='12345678-9'
    )
    print("Customer created successfully:", c.id)
except Exception as e:
    print("Error creating customer:", e)
