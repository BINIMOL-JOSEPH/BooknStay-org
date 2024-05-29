from django.db import models
from django.contrib.auth.hashers import make_password
from datetime import datetime
from user_app.models import Customer , Notification
from django.utils import timezone
from django.core.exceptions import ValidationError
room_images = 'room_images/'  

# Create your models here.

class Hotel(models.Model):
    hotel_name = models.CharField(max_length=100, null=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=100,null=False)
    address = models.CharField(max_length=100, null=False)
    city = models.CharField(max_length=100, null=False)
    district = models.CharField(max_length=100, null=False)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=100,null=False)
    license_number = models.CharField(max_length=100, null=False, unique=True)
    description = models.CharField(max_length=200, null=False)
    service_charge = models.DecimalField(max_digits=12,decimal_places=2,null=False)
    location_link = models.CharField(max_length=2047, null=True)
    status = models.CharField(max_length=100, default='inactive')
    user_type = models.CharField(max_length=100,default='hotel')
    date_joined = models.DateField(auto_now_add=True)
    updated_on = models.DateField(null=True)
    deleted_on = models.DateField(null=True)
    image = models.ImageField(upload_to=room_images, blank=True, null=True, max_length=255)

    def __str__(self):
       return self.hotel_name

    def save(self, *args, **kwargs):
        created = not self.pk
        super(Hotel, self).save(*args, **kwargs)
        if created:
            Notification.objects.create(
                hotel=self,
                notification_type="Hotel Registration",
                message=f"A new hotel has registered: {self.hotel_name} ",
                created_at=timezone.now(),
            )


# room type model
class RoomType(models.Model):
    room_type = models.CharField(max_length=20, null=False)
    created_at = models.DateField(auto_now_add=True)
    updated_on = models.DateField(null=True)

# room details model
class RoomDetails(models.Model):
    hotel_id = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    room_type_id = models.ForeignKey(RoomType, on_delete=models.CASCADE)
    number_of_rooms = models.BigIntegerField()
    room_facilities = models.CharField(max_length=250, null=False)
    rate = models.DecimalField(max_digits=10, decimal_places=2)  
    date_joined = models.DateField(auto_now_add=True)
    updated_on = models.DateField(null=True)
    deleted_on = models.DateField(null=True)
    booked_rooms  = models.BigIntegerField(default = 0)
    status = models.CharField(max_length=100, default='active')


#room images model  
    
class RoomImages(models.Model):
    room_details_id = models.ForeignKey(RoomDetails, on_delete=models.CASCADE)
    image1 = models.ImageField(upload_to=room_images, blank=True, null=True, max_length=255)
    image2 = models.ImageField(upload_to=room_images, blank=True, null=True, max_length=255)
    image3 = models.ImageField(upload_to=room_images, blank=True, null=True, max_length=255)

    def save(self, *args, **kwargs):
        if self.pk is not None:
            existing_instance = RoomImages.objects.get(pk=self.pk)

            if not self.image1 and existing_instance.image1:
                self.image1 = existing_instance.image1

            if not self.image2 and existing_instance.image2:
                self.image2 = existing_instance.image2

            if not self.image3 and existing_instance.image3:
                self.image3 = existing_instance.image3

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Images for Room {self.room_details_id}"
    
# review model
review_images = 'review_images/'     
class Review(models.Model):
    hotel_email = models.CharField(max_length=250, null=False, default=None)
    customer_name = models.CharField(max_length=250, null=False, default=None)
    rating = models.IntegerField(null=False)
    title = models.CharField(max_length=250, null=False)
    comment = models.CharField(max_length=250, null=False)
    created_at = models.DateField(null=True, default=timezone.now)
    updated_on = models.DateField(null=True)
    deleted_on = models.DateField(null=True)
    feedbacks = models.CharField(max_length=250, blank=True)
    feedbacks_created_at = models.DateField(null=True)
    feedbacks_updated_on = models.DateField(null=True)
    status = models.CharField(max_length=20, null=False, default='active')

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()

        super().save(*args, **kwargs)

class ReviewImage(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/', max_length=255)

    def save(self, *args, **kwargs):
        max_images_limit = 100
        total_images_count = ReviewImage.objects.filter(review=self.review).count()
        if total_images_count >= max_images_limit:
            raise ValidationError(f'Cannot add more than {max_images_limit} images to the review.')
        
        current_datetime = datetime.now().strftime('%Y%m%d%H%M%S')
        self.image.name = f"{current_datetime}_{self.image.name}"
        super().save(*args, **kwargs)
# Additional activities model
class RoomServices(models.Model):
    hotel_id = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, null=False)
    description = models.CharField(max_length=1000, null=False)
    price = models.DecimalField(max_digits=10, decimal_places=2)  
    image = models.ImageField(upload_to='services', blank=True, null=True, max_length=255)
    status = models.CharField(max_length=100, default='active')
    created_on = models.DateField(auto_now_add=True)
    updated_on = models.DateField(null=True)
    deleted_on = models.DateField(null=True)

    def save(self, *args, **kwargs):
        if not self.pk and self.image:
            current_datetime = datetime.now().strftime('%Y%m%d%H%M%S')
            self.image.name = f"{current_datetime}_{self.image.name}"
        super().save(*args, **kwargs)


# RoomAdditionalActivities model
class RoomAdditionalActivites(models.Model):
    additional_activites = models.ForeignKey(RoomServices, on_delete=models.CASCADE)
    room_details_id = models.ForeignKey(RoomDetails, on_delete=models.CASCADE)
    hotel_id = models.IntegerField(null=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateField(auto_now_add=True)
    deleted_on = models.DateField(null=True)

class Booking(models.Model):
    room = models.ForeignKey(RoomDetails, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer,on_delete=models.CASCADE)
    hotel = models.ForeignKey(Hotel,on_delete=models.CASCADE)
    guest_name = models.CharField(max_length=100,null=False)
    email = models.EmailField()
    phone_number = models.CharField(max_length=100,null=False)
    address = models.CharField(max_length=100, null=False)
    aadhar_number = models.BigIntegerField(null=False)
    number_of_adults = models.IntegerField( null=False)
    number_of_children = models.IntegerField(null=False)
    number_of_rooms = models.IntegerField(null=False)
    check_in_date = models.DateField(null=False)
    check_out_date = models.DateField(null=False)
    booked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=100,default='in progress')
    selected_services = models.ManyToManyField(RoomServices, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        created = not self.pk
        super(Booking, self).save(*args, **kwargs)
        if created:
            Notification.objects.create(
                booking=self,
                notification_type="Hotel Booking",
                message=f"A new booking to hotel : {self.hotel} by {self.customer}",
                created_at=timezone.now(),
            )





class Payment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer,on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=100,null=False)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=100,default='pending')
    updated_at = models.DateTimeField(auto_now_add=True)

    
    def save(self, *args, **kwargs):
        if not self.amount:
            self.amount = 0.0
        if not self.payment_method:
            self.payment_method = 'in progress'
        if not self.status:
            self.status = 'pending'

        super().save(*args, **kwargs)

        if self.status == 'paid':
            Notification.objects.create(
                payment=self,
                notification_type="Payment",
                message=f"A new payment of {self.amount} has been made by {self.customer} for booking hotel {self.booking.hotel}",
                created_at=timezone.now(),
            )


