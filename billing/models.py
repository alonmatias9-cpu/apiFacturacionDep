from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Customer(TimestampedModel):
    first_name = models.CharField('Nombres', max_length=150)
    last_name = models.CharField('Apellidos', max_length=150)
    email = models.EmailField('Correo electrónico', unique=True)
    document_number = models.CharField('Número de documento (RUT/DNI)', max_length=50, unique=True)
    address = models.TextField('Dirección', blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']

class Product(TimestampedModel):
    name = models.CharField('Nombre', max_length=200)
    description = models.TextField('Descripción', blank=True, null=True)
    price = models.DecimalField('Precio', max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    stock = models.IntegerField('Stock disponible', default=0, validators=[MinValueValidator(0)])
    is_active = models.BooleanField('Activo', default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-created_at']

class Invoice(TimestampedModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Borrador'
        ISSUED = 'ISSUED', 'Emitida'
        PAID = 'PAID', 'Pagada'
        CANCELLED = 'CANCELLED', 'Anulada'

    customer = models.ForeignKey(Customer, related_name='invoices', on_delete=models.RESTRICT, verbose_name='Cliente')
    status = models.CharField('Estado', max_length=20, choices=Status.choices, default=Status.DRAFT)
    total_amount = models.DecimalField('Suma Total', max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    def __str__(self):
        return f"Factura #{self.id} - {self.customer}"
        
    class Meta:
        verbose_name = 'Factura'
        verbose_name_plural = 'Facturas'
        ordering = ['-created_at']

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.RESTRICT)
    quantity = models.PositiveIntegerField('Cantidad', validators=[MinValueValidator(1)])
    unit_price = models.DecimalField('Precio unitario', max_digits=12, decimal_places=2)
    subtotal = models.DecimalField('Subtotal', max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    class Meta:
        verbose_name = 'Detalle de Factura'
        verbose_name_plural = 'Detalles de Facturas'
