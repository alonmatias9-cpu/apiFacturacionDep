from rest_framework import serializers
from django.db import transaction
from .models import Customer, Product, Invoice, InvoiceItem

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), 
        source='product'
    )
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['id', 'unit_price', 'subtotal']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    customer_detail = CustomerSerializer(source='customer', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'customer', 'customer_detail', 'status', 'total_amount', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("La factura debe tener al menos un detalle (item).")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        with transaction.atomic():
            invoice = Invoice.objects.create(**validated_data)
            
            total_amount = 0
            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                
                if product.stock < quantity:
                    raise serializers.ValidationError(
                        f"Stock insuficiente para el producto {product.name}. Stock actual: {product.stock}"
                    )
                
                # Actualizar stock
                product.stock -= quantity
                product.save()

                unit_price = product.price
                subtotal = unit_price * quantity
                total_amount += subtotal

                InvoiceItem.objects.create(
                    invoice=invoice,
                    product=product,
                    quantity=quantity,
                    unit_price=unit_price,
                    subtotal=subtotal
                )
            
            invoice.total_amount = total_amount
            invoice.save()
            return invoice

    def update(self, instance, validated_data):
        # Para simplificar y proteger la consistencia de datos,
        # en este ejemplo no permitimos actualizar los items
        # Si se envian items en el dict, los removemos.
        validated_data.pop('items', None)
        return super().update(instance, validated_data)
