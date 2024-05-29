import re 
from rest_framework import serializers
from user_app.models import Customer

# validate first name
def validate_first_name(value):
    if not re.match("^[a-zA-Z ]+$", value):
        raise serializers.ValidationError("First name can only contain letters")
    if len(value) > 50:
        raise serializers.ValidationError("First name should not exceed 50 characters")
    return value

# validate last name
def validate_last_name(value):
    if not re.match("^[a-zA-Z ]+$", value):
        raise serializers.ValidationError('Last name can only contain letters')
    if len(value) > 50:
        raise serializers.ValidationError('Last name should not exceed 50 characters')
    
# validate email
def validate_email(value):
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
        raise serializers.ValidationError("Enter a valid email address.")
    if Customer.objects.filter(email = value).exists():
        raise serializers.ValidationError("Email has been already taken")
    return value

# validate phone number
def validate_phone_number(value):
    if not re.match("^\d+$", value):
        raise serializers.ValidationError("Phone number should only contain numeric digits.")
    if len(value) != 10:
        raise serializers.ValidationError("Phone number should be 10 digits long.")
    return value

# validate password
def validate_password(value):
    if len(value) < 8 :
        raise serializers.ValidationError('Password should be 8 character long')
    if not re.search(r'[A-Za-z]', value):
        raise serializers.ValidationError("Password should contain at least one letter (uppercase or lowercase).")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Password should contain at least one digit.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise serializers.ValidationError("Password should contain at least one special character.")
    return value
