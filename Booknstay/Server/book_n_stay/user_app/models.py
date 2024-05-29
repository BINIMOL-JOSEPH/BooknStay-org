from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.hashers import make_password
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff = True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser = True')
        return self.create_user(email, password, **extra_fields)


class Login(AbstractUser):
    email = models.EmailField(unique=True)
    userType = models.CharField(max_length=30)
    status = models.CharField(max_length=10, default='active')
    last_name = None
    username = None
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name','userType', 'status']
    def reset_password(self, new_password):
        self.set_password(new_password)
        self.save()

class PasswordReset(models.Model):
    user = models.ForeignKey(Login,on_delete=models.CASCADE)
    token = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    is_reset = models.BooleanField(default=False)

    def save_and_notify(self):
        self.is_reset = True
        self.save()

        if self.pk and self.is_reset:
            Notification.objects.create(
                user=self.user,
                notification_type="Password Reset",
                message="Password Chnaged ",
                created_at=timezone.now(),
            )

class Customer(models.Model) :
    first_name = models.CharField(max_length=50, null=False)
    last_name = models.CharField(max_length=50, null=False)
    email = models.EmailField(unique=True, null=False)
    phone_number = models.CharField(max_length=10, null=False)
    address = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    user_type = models.CharField(max_length=10, default='customer')
    status = models.CharField(max_length=10, default='inactive')
    date_joined = models.DateField(auto_now_add=True)
    deleted_on = models.DateField(null=True)
    updated_on = models.DateField(null=True)

    def save(self, *args, **kwargs):
        created = not self.pk
        super(Customer, self).save(*args, **kwargs)
        if created:
            Notification.objects.create(
                customer=self,
                notification_type="Customer Registration",
                message=f"A new customer has registered: {self.first_name} {self.last_name}",
                created_at=timezone.now(),
            )


    def __str__(self):
        return self.first_name

class Notification(models.Model):
    user = models.ForeignKey('user_app.Login',on_delete =models.CASCADE,null=True)
    customer = models.ForeignKey('user_app.Customer', on_delete=models.CASCADE,null=True)
    hotel = models.ForeignKey('hotel_app.Hotel', on_delete=models.CASCADE,null=True)
    booking = models.ForeignKey('hotel_app.Booking', on_delete=models.CASCADE,null=True)
    payment = models.ForeignKey('hotel_app.Payment', on_delete=models.CASCADE,null=True)
    notification_type = models.CharField(max_length=255)
    message = models.TextField()
    is_customer_read = models.BooleanField(default=False)
    is_hotel_read = models.BooleanField(default=False)
    is_admin_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_admin_deleted = models.BooleanField(default=False)
    is_admin_favorite = models.BooleanField(default=False)
    is_hotel_deleted = models.BooleanField(default=False)
    is_hotel_favorite = models.BooleanField(default=False)
    is_customer_deleted = models.BooleanField(default=False)
    is_customer_favorite = models.BooleanField(default=False)

    def toggle_favorite(self):
        self.is_admin_favorite = not self.is_admin_favorite
        self.save()

    def hotel_toggle_favorite(self):
        self.is_hotel_favorite = not self.is_hotel_favorite
        self.save()
    
    def customer_toggle_favorite(self):
        self.is_customer_favorite = not self.is_customer_favorite
        self.save()
