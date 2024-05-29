import re
from django.db.models import Q
from hotel_app.models import Hotel
from decimal import Decimal
from django.conf import settings
from rest_framework import serializers
from datetime import datetime

string_test = "^[a-zA-Z]+$"
digit_test = "^\d+$"

def validate_hotel_name(value):
    if not re.match("^[a-zA-Z0-9& ]+$", value):
        raise serializers.ValidationError("Hotel name should only contain alphanumeric characters and & character.")
    if len(value) > 50:
        raise serializers.ValidationError("Hotel name should not exceed 50 characters.")
    return value

def validate_email(value):
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
        raise serializers.ValidationError("Enter a valid email address.")   
    if Hotel.objects.filter(Q(email__iexact=value)).exists():
        raise serializers.ValidationError("This email address is already in use.")
    return value

def validate_phone_number(value):
    if not re.match(digit_test, value):
        raise serializers.ValidationError("Phone number should only contain numeric digits.")
    if len(value) != 10:
        raise serializers.ValidationError("Phone number should be 10 digits long.")
    return value

def validate_address(value):
    if len(value) > 200:
        raise serializers.ValidationError("Address should not exceed 200 characters.")
    return value

def validate_description(value):
    if len(value) > 255:
        raise serializers.ValidationError("Description should not exceed 255 characters.")
    return value

def validate_pincode(value):
    if not re.match(digit_test, value):
        raise serializers.ValidationError("PIN code should only contain numeric digits.")
    if len(value) != 6:
        raise serializers.ValidationError("PIN code should be exactly 6 digits long.")
    return value

def validate_password(value):
    if len(value) < 8:
        raise serializers.ValidationError("Password should be at least 8 characters long.")
    if not re.search(r'[A-Za-z]', value):
        raise serializers.ValidationError("Password should contain at least one letter (uppercase or lowercase).")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Password should contain at least one digit.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise serializers.ValidationError("Password should contain at least one special character.")

    return value

def validate_city(value):
    if not re.match(string_test, value):
        raise serializers.ValidationError("City name should only contain alphabetic characters.")
    if len(value) < 3:
        raise serializers.ValidationError("City name should be at least 3 characters long.")
    if len(value) > 50:
        raise serializers.ValidationError("City name should not exceed 50 characters.")
    return value

def validate_state(value):
    if not re.match(string_test, value):
        raise serializers.ValidationError("State name should only contain alphabetic characters.")
    if len(value) < 3:
        raise serializers.ValidationError("State name should be at least 3 characters long.")
    if len(value) > 50:
        raise serializers.ValidationError("State name should not exceed 50 characters.")
    return value

def validate_district(value):
    if not re.match(string_test, value):
        raise serializers.ValidationError("District name should only contain alphabetic characters.")
    if len(value) < 3:
        raise serializers.ValidationError("District name should be at least 3 characters long.")
    if len(value) > 50:
        raise serializers.ValidationError("District name should not exceed 50 characters.")
    return value

def validate_service_charge(value):
    try:
        float_value = Decimal(value)
    except ValueError:
        raise serializers.ValidationError("A valid number is required.")
    if float_value < 0:
        raise serializers.ValidationError("Rate should be a non-negative value.")
    if float_value % 1 != 0 and float_value.as_tuple().exponent < -2:
        raise serializers.ValidationError("Ensure that there are no more than 2 decimal places.")
    return float_value


def validate_license_number(value):
    if not re.match(r'^\d{2}-\d{4}-\d{4}$', value):
        raise serializers.ValidationError("Invalid license number format. Please use the format XX-XXXX-XXXX.")
    if Hotel.objects.filter(Q(license_number__iexact=value)).exists():
        raise serializers.ValidationError("This license number is already in use.")
    return value

# validations for room_type
def validate_room_type(value):
    if not re.match("^[a-zA-Z\s]+$", value):
        raise serializers.ValidationError("Room type can only contain letters and spaces")
    if len(value) > 50:
        raise serializers.ValidationError("Room type should not exceed 50 characters")
    return value

# validations for room_details



def validate_number_of_rooms(value):
    try:
        int_value = int(value)

        if int_value < 0:
            raise serializers.ValidationError("Number of rooms must be a non-negative integer.")
    except ValueError:
        raise serializers.ValidationError("Number of rooms must be a valid integer.")
    
def validate_room_facilities(value):
    if not re.match("^[a-zA-Z, ]+$", value):
        raise serializers.ValidationError("Room Facilities can only contain letters, commas, and spaces")
    if len(value) > 250:
        raise serializers.ValidationError("Room Facilities should not exceed 50 characters")
    return value


def validate_image(value, required=True):
    allowed_extensions = ['jpeg', 'jpg', 'png']

    if not value and required:
        raise serializers.ValidationError("This field is required.")

    if value:
        extension = value.name.split('.')[-1].lower()

        if extension not in allowed_extensions:
            raise serializers.ValidationError("Invalid file extension. Only jpeg, jpg, and png are allowed.")

        if value.size > settings.MAX_FILE_SIZE_BYTES:
            raise serializers.ValidationError("File size exceeds the maximum allowed limit of 5 MB.")

def validate_review_image(value):
    allowed_extensions = ['jpeg', 'jpg', 'png']

    if value:
        extension = value.name.split('.')[-1].lower()

        if extension not in allowed_extensions:
            raise serializers.ValidationError("Invalid file extension. Only jpeg, jpg, and png are allowed.")
        
        if value.size > 1 * 1024 * 1024:
            raise serializers.ValidationError("File size exceeds the maximum allowed limit of 1 MB.")
        
#room services validations
def validate_title(value):
    if not re.match("^[a-zA-Z, ]+$", value):
        raise serializers.ValidationError("Room actitivties title can only contain letters, commas, and spaces")
    if not value.strip():
        raise serializers.ValidationError("Room actitivities title should not be blank")
    if len(value) > 200:
        raise serializers.ValidationError("Room activities should not exceed 200 characters")
    return value


def validate_roomdescription(value):
    if len(value) > 1000:
        raise serializers.ValidationError("Description should not exceed 1000 characters.")
    return value

def validate_guest_name(value):
    if not re.match("^[a-zA-Z ]+$", value):
        raise serializers.ValidationError('Name can only contain letters')
    if len(value) > 50:
        raise serializers.ValidationError('Name should not exceed 50 characters')

def validate_guest_email(value):
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
        raise serializers.ValidationError("Enter a valid email address.")   
    return value

def validate_aadhar_number(value):
    if not re.match(digit_test, value):
        raise serializers.ValidationError("Aadhar number should only contain numeric digits.")
    if len(value) != 12:
        raise serializers.ValidationError("Aadhar number should be 12 digits long.")
    return value

def validate_number_of_person(value):
    try:
        int_value = int(value)

        if int_value < 0:
            raise serializers.ValidationError("Number of people must be a non-negative integer.")
    except ValueError:
        raise serializers.ValidationError("Number of people must be a valid integer.")
    
def validate_booking_date(value):
    today = datetime.now().date()
    if value < today:
        raise serializers.ValidationError('Selected ate cannot be a past date.')
