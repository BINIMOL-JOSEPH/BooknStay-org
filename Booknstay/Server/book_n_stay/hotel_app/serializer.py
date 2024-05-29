from rest_framework import serializers
from hotel_app.models import (
    Hotel,
    RoomType,
    RoomDetails,
    RoomImages,
    RoomServices,
    RoomAdditionalActivites,
    Booking,
    Payment,
    ReviewImage
)
from hotel_app.validator import (
    validate_hotel_name,
    validate_email,
    validate_address,
    validate_city,
    validate_description,
    validate_district,
    validate_license_number,
    validate_password,
    validate_phone_number,
    validate_pincode,
    validate_room_type,
    validate_service_charge,
    validate_state,
    validate_image,
    validate_number_of_rooms,
    validate_room_facilities,
    validate_review_image,
    validate_title,
    validate_roomdescription,
    validate_review_image,
    validate_guest_name,
    validate_guest_email,
    validate_aadhar_number,
    validate_number_of_person,
    validate_booking_date
)
from user_app.models import Login
from django.contrib.auth.hashers import make_password
from hotel_app.models import Review


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

    hotel_name = serializers.CharField(validators=[validate_hotel_name])
    email = serializers.EmailField(validators=[validate_email])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    address = serializers.CharField(validators=[validate_address])
    city = serializers.CharField(validators=[validate_city])
    password = serializers.CharField(validators=[validate_password])
    district = serializers.CharField(validators=[validate_district])
    state = serializers.CharField(validators=[validate_state])
    pincode = serializers.CharField(validators=[validate_pincode])
    license_number = serializers.CharField(validators=[validate_license_number])
    description = serializers.CharField(validators=[validate_description])
    service_charge = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[validate_service_charge])
    location_link = serializers.CharField(required=False)
    updated_on = serializers.DateField(required=False, default=None)
    deleted_on = serializers.DateField(required=False, default=None)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        hotel_name = validated_data.get('hotel_name')
        hotel = Hotel.objects.create(**validated_data)

        login_data = {
            'email': validated_data['email'],
            'password': make_password(password),  
            'userType': 'hotel',
            'status': 'inactive',
            'first_name': hotel_name,
        }
        Login.objects.create(**login_data)

        return hotel

class ListHotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

    hotel_name = serializers.CharField(validators=[validate_hotel_name])
    email = serializers.EmailField(validators=[validate_email])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    address = serializers.CharField(validators=[validate_address])
    city = serializers.CharField(validators=[validate_city])
    district = serializers.CharField(validators=[validate_district])
    state = serializers.CharField(validators=[validate_state])
    pincode = serializers.CharField(validators=[validate_pincode])
    license_number = serializers.CharField(validators=[validate_license_number])
    description = serializers.CharField(validators=[validate_description])
    service_charge = serializers.DecimalField(max_digits=12, decimal_places=2, validators=[validate_service_charge])
    updated_on = serializers.DateField(required=False, default=None)
    deleted_on = serializers.DateField(required=False, default=None)
    location_link = serializers.CharField(required=False)

# add room type serializers
class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = '__all__'

    room_type = serializers.CharField(validators=[validate_room_type])

class RoomDetailsSerializer(serializers.ModelSerializer):
    room_type_name = serializers.SerializerMethodField()
    hotel_name = serializers.SerializerMethodField()

    class Meta:
        model = RoomDetails
        fields = '__all__'

    number_of_rooms = serializers.IntegerField(validators=[validate_number_of_rooms])
    room_facilities = serializers.CharField(validators=[validate_room_facilities])
    rate = serializers.DecimalField(max_digits=10, decimal_places=2, validators=[validate_service_charge])


    def get_room_type_name(self, obj):
        return obj.room_type_id.room_type 

    def get_hotel_name(self, obj):
        return obj.hotel_id.hotel_name 

# add room images serializer
class RoomImagesSerializer(serializers.ModelSerializer):
    image1 = serializers.ImageField(validators=[validate_image])
    image2 = serializers.ImageField(validators=[validate_image], required=False, allow_null=True)
    image3 = serializers.ImageField(validators=[validate_image], required=False, allow_null=True)

    class Meta:
        model = RoomImages
        fields = ['room_details_id', 'image1', 'image2', 'image3']
    
    def to_internal_value(self, data):
        room_details_id = data.get('room_details_id')
        image1 = data.get('image1')
        image2 = data.get('image2')
        image3 = data.get('image3')

        if isinstance(room_details_id, RoomDetails):
            data['room_details_id'] = room_details_id.id

        images_data = {'room_details_id': room_details_id, 'image1': image1}
        if image2:
            images_data['image2'] = image2
        if image3:
            images_data['image3'] = image3

        return super().to_internal_value(images_data)


# review serializer
class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = '__all__'

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ('id', 'review', 'image') 
    image = serializers.ImageField(validators=[validate_review_image], required=False)


# edit hotel details serializer
class EditHotelSerializer(serializers.ModelSerializer):

    class Meta : 
        model = Hotel
        fields = ['hotel_name','phone_number','address','city','district','state','pincode','description','service_charge','updated_on','location_link','image']

    hotel_name = serializers.CharField(validators=[validate_hotel_name])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    address = serializers.CharField(validators=[validate_address])
    city = serializers.CharField(validators=[validate_city])
    district = serializers.CharField(validators=[validate_district])
    state = serializers.CharField(validators=[validate_state])
    pincode = serializers.CharField(validators=[validate_pincode])
    description = serializers.CharField(validators=[validate_description])
    service_charge = serializers.DecimalField(max_digits=12, decimal_places=2,validators=[validate_service_charge])
    location_link = serializers.CharField()
    updated_on = serializers.DateField()
    image = serializers.ImageField(validators=[validate_review_image], required=False, allow_null=True)


# review serializer
class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = '__all__'  
    
#add room services serializer
class RoomServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomServices
        fields = '__all__'

    title = serializers.CharField(max_length=100, validators=[validate_title], required=True)
    description = serializers.CharField(max_length=250, validators=[validate_roomdescription], required=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, validators=[validate_service_charge], required=True)
    image = serializers.ImageField(validators=[validate_image], required=False)
        
    def create(self, validated_data):
        hotel_id = self.context.get('hotel_id')

        if hotel_id is not None:
            hotel_instance = Hotel.objects.get(id=hotel_id)
            validated_data['hotel_id'] = hotel_instance

        return super().create(validated_data)
    
# add additional activites to rooms
class RoomsAdditionalActivitesSerializer(serializers.ModelSerializer):

    additional_activites_details = RoomServicesSerializer(source='additional_activites', read_only=True) 
    class Meta:
        model = RoomAdditionalActivites
        fields = '__all__'

# booking serializer
class BookingSerializer(serializers.ModelSerializer):

    hotel_name = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    booked_at = serializers.SerializerMethodField()

    def get_booked_at(self, obj):
        return obj.booked_at.strftime('%Y-%m-%d')
    
    class Meta : 
        model = Booking
        fields = '__all__'

    guest_name = serializers.CharField(validators=[validate_guest_name])
    phone_number = serializers.CharField(validators=[validate_phone_number])
    address = serializers.CharField(validators=[validate_address])
    email = serializers.CharField(validators=[validate_guest_email])
    aadhar_number = serializers.CharField(validators=[validate_aadhar_number])
    number_of_rooms = serializers.CharField(validators=[validate_number_of_rooms])
    number_of_adults = serializers.CharField(validators=[validate_number_of_person])
    number_of_children = serializers.CharField(validators=[validate_number_of_person])
    check_in_date = serializers.DateField(validators=[validate_booking_date])
    check_out_date = serializers.DateField(validators=[validate_booking_date])

    def get_hotel_name(self, obj):
        return obj.hotel.hotel_name 
    
    def get_room_type(self, obj):
        return obj.room.room_type_id.room_type


#payment serializer
class PaymentSerializer(serializers.ModelSerializer):

    customer_name = serializers.SerializerMethodField()
    paid_at = serializers.SerializerMethodField()

    def get_paid_at(self, obj):
        return obj.paid_at.strftime('%Y-%m-%d')

    class Meta : 
        model = Payment
        fields = '__all__'

    amount = serializers.DecimalField(max_digits=10, decimal_places=2, validators=[validate_service_charge], required=False)
    payment_method = serializers.CharField( required=False)
    payment_id = serializers.CharField( required=False)

    def get_customer_name(self, obj):
        return obj.customer.first_name
