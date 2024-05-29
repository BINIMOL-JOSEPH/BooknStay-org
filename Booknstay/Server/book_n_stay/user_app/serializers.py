from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from user_app.models import Customer, Login
from user_app.validator import (
    validate_email,
    validate_first_name,
    validate_last_name,
    validate_password,
    validate_phone_number
)



# Login serializer
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    def validate_email(self,value):
        try:
            Login.objects.get(email=value)
        except Login.DoesNotExist:
            raise serializers.ValidationError("User with this Email does not exist")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()
    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        if new_password != confirm_password:
            raise serializers.ValidationError("Passwords do not match")
        return data

# customer registration serializer
class CustomerSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Customer
        fields = '__all__'

    first_name = serializers.CharField(validators=[validate_first_name])
    last_name = serializers.CharField(validators=[validate_last_name])
    email = serializers.EmailField(validators=[validate_email])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    password = serializers.CharField(validators=[validate_password])
    deleted_on = serializers.DateField(required=False, default=None)
    updated_on = serializers.DateField(required=False, default=None)

    def create(self, validated_data):
        password = validated_data.pop('password')

        customer = Customer.objects.create(**validated_data)
        login_data = {
            'email': validated_data['email'],
            'password': make_password(password),
            'userType': 'customer',
            'first_name' : validated_data['first_name'],
            'status': 'inactive',
        }
        Login.objects.create(**login_data)

        return customer

class ListCustomerSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Customer
        fields = '__all__'
       

    first_name = serializers.CharField(validators=[validate_first_name])
    last_name = serializers.CharField(validators=[validate_last_name])
    email = serializers.EmailField(validators=[validate_email])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    deleted_on = serializers.DateField(required=False, default=None)
    updated_on = serializers.DateField(required=False, default=None)

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate(self, data):
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        if new_password != confirm_password:
            raise serializers.ValidationError("New password and Confirm password do not match")

        return data


class SupervisorSerializer(serializers.ModelSerializer):

    class Meta : 
        model = Login
        fields = '__all__'

    first_name = serializers.CharField(validators=[validate_first_name])
    email = serializers.EmailField(validators = [validate_email])
    password = serializers.CharField(validators = [validate_password])
    userType = serializers.CharField(default = 'supervisor')
    status = serializers.CharField(default = 'active')

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)

class EditCustomerSerializer(serializers.ModelSerializer):
    class Meta :
        model = Customer
        fields = ['first_name','last_name','phone_number','updated_on','address','state']
    
    first_name = serializers.CharField(validators=[validate_first_name])
    last_name = serializers.CharField(validators=[validate_last_name])
    address = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(validators = [validate_phone_number])
    updated_on = serializers.DateField()