from django.utils import timezone  
from rest_framework import status
from user_app.models import (
    Customer,
    Login,
    PasswordReset,
    Notification
)
from rest_framework.permissions import AllowAny,IsAuthenticated  
from rest_framework_simplejwt.tokens import RefreshToken 
from rest_framework.views import APIView
from rest_framework.response import Response 
from django.contrib.auth.hashers import check_password
from book_n_stay.pagination import CustomPagination
from book_n_stay.permissions import (
    AdminPermission, 
    AdminSupervisorPermission,
    All, CustomerPermission,
)
from django.db.models import Q
from django.core.mail import send_mail
from django.utils.html import format_html
from book_n_stay import settings
from datetime import datetime
from user_app.serializers import (
    CustomerSerializer,
    EditCustomerSerializer,
    LoginSerializer,
    SupervisorSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    ListCustomerSerializer
) 
from django.template.loader import render_to_string
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from hotel_app.models import Hotel,Booking,Review,RoomDetails
from django.db.models import Avg
from book_n_stay.paginations import CustomPaginations
from django.utils.timezone import localtime, now
from datetime import datetime, timedelta


# Create your views here.
# common variable

invalid_data = "Invalid input data"
user_not_found = "User not found"
user_data_not_found = "User data not found"
invalid_credentials = "Invalid credentials"
notification_not_found = 'Notification not found'
mail_notification = 'hotel_app/emailnotifications.html'

#search
def search_supervisor(query):
    search_result = Login.objects.filter(
        Q(first_name__icontains=query) |
        Q(email__icontains=query)
    )
    return search_result


def modify_pagination_urls(paginator):
    url_next = replace_http_with_https(paginator.get_next_link())
    url_previous = replace_http_with_https(paginator.get_previous_link())
    return url_next, url_previous

#LoginView
class LoginView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        serialized_data = LoginSerializer(data=request.data)
        
        if not serialized_data.is_valid():
            return Response({
                "error": invalid_credentials,
                "errors": serialized_data.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        email = serialized_data.validated_data['email']
        password = serialized_data.validated_data['password']
        
        try:
            user = Login.objects.get(email=email)
        except Login.DoesNotExist:
            return Response({
                "error": invalid_credentials
            }, status=status.HTTP_400_BAD_REQUEST)
        if user.status != 'active':
            return Response({
                "error": invalid_credentials
            }, status=status.HTTP_400_BAD_REQUEST)
        if check_password(password, user.password):
            refresh = RefreshToken.for_user(user)
            response_data = {
                "message": "Login Success",
                "refreshToken": str(refresh),
                "accessToken": str(refresh.access_token),
                "userType": user.userType,
                "first_name": user.first_name,
                "id" : user.id


            } 
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": invalid_credentials
            }, status=status.HTTP_400_BAD_REQUEST)

class MyTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) +
            str(user.is_active)
        )

my_token_generator = MyTokenGenerator()

class ForgotPasswordView(APIView):
    @method_decorator(csrf_exempt, name='dispatch')
    def send_reset_email(self, user, reset_link):
        subject = 'BooknStay - Password Reset'
        email_content = render_to_string('user_app/send_reset_password.html', {'name': user.first_name, 'reset_link': reset_link})
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [user.email]
        send_mail(subject, "", from_email, recipient_list, html_message=email_content)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": invalid_data, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        email = serializer.validated_data.get('email')
        try:
            user = Login.objects.get(email=email)
        except Login.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
        reset_token = my_token_generator.make_token(user)
        PasswordReset.objects.create(user=user, token=reset_token)
        reset_link = f"{settings.RESET_PASSWORD_URL}{reset_token}/"
        self.send_reset_email(user, reset_link)
        return Response(
            {"message": "Password reset link sent successfully, check your email", "token": reset_token},
            status=status.HTTP_200_OK,
        )
    

class CheckTokenExpiredView(APIView):
    def get(self, request, token):
        try:
            password_reset = PasswordReset.objects.get(token=token)
        except PasswordReset.DoesNotExist:
            return Response({"isExpired": True}, status=status.HTTP_404_NOT_FOUND)

        if password_reset.created_at < timezone.now() - timezone.timedelta(hours=2):
            return Response({"isExpired": True}, status=status.HTTP_200_OK)
        else:
            return Response({"isExpired": False}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ResetPassword(APIView):
    def post(self, request, token):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            password_reset = PasswordReset.objects.get(token=token)
        except PasswordReset.DoesNotExist:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = password_reset.user
        password_reset.save_and_notify()
        user.reset_password(serializer.validated_data['new_password'])
        password_reset.delete() 
        return Response(
            {"message": "Password reset successfully, you can log in with the new password"},
            status=status.HTTP_200_OK,
        )



# create supervisor view
class CreateSupervisor(APIView):
    permission_classes = [ IsAuthenticated, AdminPermission ]

    def post(self, request, format=None):
        serializer = SupervisorSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'message' : 'Supervisor created successfully'
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# sent verification email
def sent_verification_mail(to_email, link, name):
    subject = 'BooknStay - Verify your account'
    message = render_to_string('email_verification.html', {'name': name,'link':link})

    from_mail = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, '', from_mail, recipient_list, html_message=message)


# email verification view
class VerifyEmail(APIView):
    def get(self, request, user_id, format=None):
        try:
            customer = Customer.objects.get(id=user_id)
        except Customer.DoesNotExist:
            return Response({'message': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)

        if customer.status == 'inactive':
            login_user, _ = Login.objects.update_or_create(
                email=customer.email,
                defaults={'status': 'active'}
            )

            customer.status = 'active'
            customer.save()

            return Response({'message': 'Email verification successful. You can now log in.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User account is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

# customer register view 
class CustomerRegister(APIView):
    def post(self, request, format=None):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            verification_link = f"{settings.VERIFY_EMAIL_URL}{customer.id}"
            sent_verification_mail(customer.email, verification_link, customer.first_name)
            return Response({
                'message': 'Verification mail has been sent to the registered email address. Please verify to login!'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#search user by first_name, last_name or email   
def search_user_details(query):

    search_result = Customer.objects.filter(
        Q(first_name__icontains=query) |    
        Q(last_name__icontains=query) | 
        Q(email__icontains=query) 
   
    )
    return search_result

def replace_http_with_https(url):
        if url:
            return url.replace('http://', 'https://')
        return None
    
class GetUserDetails(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def get(self, request, format=None):
        try:
            query = request.GET.get('query')
            if query:
                customers = search_user_details(query).filter(user_type="customer")
            else:
                customers = Customer.objects.filter(user_type="customer")
            if customers:
                pagination_class = CustomPagination()
                paginated_result = pagination_class.paginate_queryset(customers, request)
                serializer = ListCustomerSerializer(paginated_result, many=True)

                # Replace pagination URLs with HTTPS
                url_next, url_previous = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next:
                    paginated_response['next'] = url_next
                if url_previous:
                    paginated_response['previous'] = url_previous

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next,
                    'previous': url_previous,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            else:
                return Response({'message': 'No users found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_417_EXPECTATION_FAILED)

#sort user details by status
class UserDetailsByStatus(APIView):
    permission_classes = [IsAuthenticated,AdminSupervisorPermission]
    def get(self, request, userstatus,format=None):
        try:
            customers = Customer.objects.filter(status=userstatus)
            if(customers):
                pagination_class = CustomPagination()
                paginated_result=pagination_class.paginate_queryset(customers,request)
                serializer = ListCustomerSerializer(paginated_result, many=True)
                return pagination_class.get_paginated_response(serializer.data)
            else:
                return Response({'message': f' No {userstatus} users found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_417_EXPECTATION_FAILED)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, All]

    def post(self, request):
        serialized_data = ChangePasswordSerializer(data=request.data)
        
        if not serialized_data.is_valid():
            return Response({"error": invalid_data, "errors": serialized_data.errors}, status=status.HTTP_400_BAD_REQUEST)

        current_password = serialized_data.validated_data['current_password']
        new_password = serialized_data.validated_data['new_password']
        if not check_password(current_password, request.user.password):
            return Response({"error": "Incorrect current password"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password == current_password:
            return Response({"error": "New password and current password are the same"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()

        return Response({"message": "Password changed successfully!!!!"})

class EditUser(APIView):
    permission_classes = [IsAuthenticated,CustomerPermission]

    def get_user(self, id):
        try:
            return Login.objects.get(id=id)           
        except Login.DoesNotExist:
            return None

    def get(self, request):
        user_id = request.user.id
        user = self.get_user(user_id)
        if user is None:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
        if user.status != 'active':
            return Response({'message':'User is not active'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                customer = Customer.objects.get(email=user.email)
            except Customer.DoesNotExist:
                return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)
            if customer:
                return Response({
                'first_name': customer.first_name,
                'last_name': customer.last_name,
                'phone_number': customer.phone_number,
                'email' : customer.email,
                'address' : customer.address,
                'state' : customer.state
                }) 

    def put(self, request):
        user_id = request.user.id
        user = self.get_user(user_id)
        if user is None:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
        if user.status != 'active':
            return Response({'message':'User is not active'}, status=status.HTTP_400_BAD_REQUEST)
        else:  
            try:
                customer = Customer.objects.get(email=user.email)
            except Customer.DoesNotExist:
                return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)
            
            data={
                'first_name' : request.data.get('first_name'),
                'last_name' : request.data.get('last_name'),
                'phone_number':request.data.get('phone_number'),
                'address' : request.data.get('address'),
                'state' : request.data.get('state'),
                'updated_on' : timezone.now().date()
            }

            serializer =EditCustomerSerializer(customer, data)
            if serializer.is_valid():
                serializer.save()

                user_login = Login.objects.get(email=user.email)
                user_login.first_name = data['first_name']
                user_login.save()  
                     
                return Response({'message': 'User details updated successfully'})
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckActivity(APIView):
    def get(self, request, customer_id):
        try:
            active_bookings = Booking.objects.filter(customer_id=customer_id, status='confirmed').exists()
            return Response({'has_active_bookings': active_bookings}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f"Error checking customer activity: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def notification_mail(to_email, customer_name, action):
    subject = f'BooknStay - {action.capitalize()} Customer'
    
    if action == 'suspended':
        email_content = render_to_string(mail_notification, {'customer_name': customer_name, 'action': 'suspended'})
        message = "Customer suspension notification"
    elif action == 'delete':
        email_content = render_to_string(mail_notification, {'customer_name': customer_name, 'action': 'delete'})
        message = "Customer deletion notification"
    elif action == 'active':
        email_content = render_to_string(mail_notification, {'customer_name': customer_name, 'action': 'active'})
        message = "Customer active notification"
    else:
        raise ValueError('Invalid action provided')

    from_email = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, message, from_email, recipient_list, html_message=email_content)

def get_customer_data(id):
    try:
        customer = Customer.objects.get(id=id)
        return customer
    except Customer.DoesNotExist:
        return None

def get_user_data(email):
    try:
        user = Login.objects.get(email=email)
        return user
    except Login.DoesNotExist:
        return None

class SuspendUser(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, id):
        try:
            customer = get_customer_data(id)
            if not customer:
                return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)

            user = get_user_data(customer.email)
            if not user:
                return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)

            check_activity_instance = CheckActivity()
            check_activity_response = check_activity_instance.get(request, customer.id)

            if check_activity_response.data.get('has_active_bookings', False):
                return Response({
                    'message': 'Unable to suspend the customer. Customer has active bookings.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                if customer.status == 'active':
                    customer.status = 'suspended'
                    customer_name = customer.first_name
                    customer.save()
                    user.status = 'suspended'
                    user.save()
                    notification_mail(customer.email, customer_name, action='suspended')

                    return Response({'message': 'User suspended successfully'}, status=status.HTTP_200_OK)
                elif customer.status == 'suspended':
                    return Response({'message': 'User is already suspended'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'message': 'User should be active in order to be suspended'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'message': 'An error occurred, please try again later'}, status=status.HTTP_400_BAD_REQUEST)

class DeleteUser(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, id):
        try:
            customer = get_customer_data(id)
            if not customer:
                return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)

            user = get_user_data(customer.email)
            if not user:
                return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)
            
            check_activity_instance = CheckActivity()
            activity_response = check_activity_instance.get(request, customer.id)
            has_active_bookings = activity_response.data.get('has_active_bookings', False)

            if has_active_bookings:
                return Response({
                    'message': 'Unable to delete the customer. Customer has active bookings.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                customer_name = customer.first_name
                customer.delete()
                user.delete()
                notification_mail(customer.email, customer_name, action='delete')
                return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)

        except Exception:
            return Response({'message': 'An error occurred, please try again later'}, status=status.HTTP_400_BAD_REQUEST)

class ViewCustomer(APIView):
    permission_classes=[IsAuthenticated]
    serializer_class = ListCustomerSerializer
     
    def get(self, request,id):
        try:
            customer = Customer.objects.filter(id=id)
            if customer:
                serializer = ListCustomerSerializer(customer, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'message': ' No data found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': f'There is something wrong occurs: {str(e)}'},status=status.HTTP_400_BAD_REQUEST)

# list supervisors
class ListSupervisors(APIView) :
    permission_classes = [ IsAuthenticated, AdminPermission ]
    
    def get(self, request, format=None):
        pagination_class = CustomPagination()

        try:
            query = request.GET.get('query')

            if query :
                supervisor = search_supervisor(query).filter(userType="supervisor")
            else :
                supervisor = Login.objects.filter(userType='supervisor')  
            
            if supervisor:
                paginated_result = pagination_class.paginate_queryset(supervisor,request)
                serializer = SupervisorSerializer(paginated_result, many=True)
            
                # Replace pagination URLs with HTTPS
                url_next, url_previous = modify_pagination_urls(pagination_class)

                paginated_response = pagination_class.get_paginated_response(serializer.data)

                if url_next:
                    paginated_response['next'] = url_next
                if url_previous:
                    paginated_response['previous'] = url_previous

                response_data = {
                    'count': pagination_class.page.paginator.count,
                    'next': url_next,
                    'previous': url_previous,
                    'results': paginated_response.data['results'],
                }

                return Response(response_data)
            else:
                return Response({'message': ' No supervisors found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
 
            return Response({'message': f'There is something wrong occurs: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)  

def email_notification_mail(to_email, superviosr_name, action):
    subject = f'BooknStay - {action.capitalize()} Supervisor'
    
    if action == 'delete':
        email_content = render_to_string(mail_notification, {'superviosr_name': superviosr_name, 'action': 'delete'})
        message = "Customer deletion notification"
    else:
        raise ValueError('Invalid action provided')
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [to_email]
    send_mail(subject, message, from_email, recipient_list, html_message=email_content)

    
class DeleteSuperVisor(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]
    def post(self, request, id):
        try:
            supervisor = Login.objects.get(id=id)
        except Login.DoesNotExist:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
        try:
            user = Login.objects.get(email=supervisor.email)
        except Login.DoesNotExist:
            return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)
        else:
            supervisor_name = supervisor.first_name
            supervisor.delete()
            user.delete()
            email_notification_mail(supervisor.email, supervisor_name, action='delete')

        return Response({'message': 'Supervisor deleted successfully'}, status=status.HTTP_200_OK)


# delete customer user account
class DeleteCustomerAccount(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get_customer_id(self, user_email):
        try:
            login_user = Login.objects.get(email=user_email)
            customer = Customer.objects.get(email=login_user.email)
            return customer.id
        except Login.DoesNotExist:
            return None
        except Customer.DoesNotExist:
            return None

    def put(self, request, *args, **kwargs):
        user_email = request.user.email
        customer_id = self.get_customer_id(user_email)

        if customer_id is None:
            return Response({
                'detail': 'Customer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        has_active_bookings = Booking.objects.filter(customer_id=customer_id, status='confirmed').exists()

        if has_active_bookings:
            return Response({
                'detail': 'You can\'t delete your account. You have active bookings. Please check'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                customer = Customer.objects.get(id=customer_id)

                deleted_email = f"{customer.email}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

                customer.email = deleted_email
                customer.status = 'deleted'
                customer.save()

                login_user = Login.objects.get(email=user_email)
                login_user.email = deleted_email
                login_user.status = 'deleted'
                login_user.save()

                return Response({
                    'detail': 'Customer account deleted successfully',
                    'new_email': deleted_email
                }, status=status.HTTP_200_OK)
            except Customer.DoesNotExist:
                return Response({
                    'detail': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)

class ActivateCustomer(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def post(self, request, customer_id):
        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = Login.objects.get(email=customer.email)
        except Login.DoesNotExist:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)

        if customer.status == 'suspended':
            customer.status = 'active'
            customer_name = customer.first_name
            customer.save()
            user.status = 'active'
            user.save()
            notification_mail(customer.email, customer_name, action='active')

            return Response({'message': 'Customer activated successfully'}, status=status.HTTP_200_OK)
        elif customer.status == 'active':
            return Response({'message': 'Customer is already active'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Customer should be suspended to be activated'}, status=status.HTTP_400_BAD_REQUEST)

class CountList(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def get(self, request, format=None):
        try:
            activecustomercount = Customer.objects.filter(status='active').count()
            active_hotel_count = Hotel.objects.filter(status='active').count()
            bookings = Booking.objects.count()
            reviews = Review.objects.count()

            return Response({
                'active customers': activecustomercount,
                'active hotels': active_hotel_count,
                'bookings_count':bookings,
                'reviews_count': reviews,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class HotelBookingGraph(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def get(self, request, format=None):
        try:
            hotels = Hotel.objects.filter(status='active')
            hotel_data = []
            
            for hotel in hotels:
                room_details = RoomDetails.objects.filter(hotel_id=hotel)
                bookings = Booking.objects.filter(room__in=room_details)
                
                booking_data = {
                    'hotel_name': hotel.hotel_name,
                    'booking_count': bookings.count(),
                }
                
                hotel_data.append(booking_data)

            return Response(hotel_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CountHotelStatus(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def get(self, request, format=None):
        try:
            active_hotel_count = Hotel.objects.filter(status='active').count()
            inactive_hotel_count = Hotel.objects.filter(status='inactive').count()
            rejected_hotel_count = Hotel.objects.filter(status='rejected').count()
            suspended_hotel_count = Hotel.objects.filter(status='suspended').count()
            deleted_hotel_count = Hotel.objects.filter(status='deleted').count()

            return Response({
                'active_hotels': active_hotel_count,
                'inactive_hotels': inactive_hotel_count,
                'rejected_hotels': rejected_hotel_count,
                'suspended_hotels': suspended_hotel_count,
                'deleted_hotels': deleted_hotel_count,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HotelAverageRating(APIView):
    permission_classes = [IsAuthenticated, AdminSupervisorPermission]

    def get(self, request, format=None):
        try:
            hotels_with_average_ratings = Review.objects.values('hotel_email').annotate(
                average_rating=Avg('rating'),
            )

            hotel_data = []
            for hotel in hotels_with_average_ratings:
                hotel_email = hotel['hotel_email']
                matching_hotel = Hotel.objects.filter(email=hotel_email).first()

                if matching_hotel:
                    average_rating = round(hotel['average_rating'] or 0, 2)
                    hotel_data.append({
                        'hotel_email': hotel_email,
                        'hotel_name': matching_hotel.hotel_name,
                        'average_rating': average_rating,
                    })

            return Response(hotel_data, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = f"An error occurred: {str(e)}"
            return Response({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetUserData(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        try:
            user = Login.objects.get(id=user_id)   
        except Login.DoesNotExist:
            return Response({'message': user_not_found}, status=status.HTTP_404_NOT_FOUND)
        
        if user.status != 'active':
            return Response({'message':'User account is not active'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            try:
                customer = Customer.objects.get(email=user.email)
            except Customer.DoesNotExist:
                return Response({'message': user_data_not_found}, status=status.HTTP_404_NOT_FOUND)
            if customer:
                serializer = ListCustomerSerializer(customer)
                return Response(serializer.data, status=status.HTTP_200_OK)

def get_human_readable_time(created_at):
    now_time = now()
    local_created_at = localtime(created_at)

    time_difference = now_time - local_created_at
    time_difference_minutes = time_difference.total_seconds() // 60
    time_difference_hours = time_difference_minutes // 60

    if time_difference_minutes < 1:
        return "just now"
    elif time_difference_minutes < 60:
        return f"{int(time_difference_minutes)} minute{'s' if int(time_difference_minutes) > 1 else ''} ago"
    elif time_difference_hours < 24:
        return f"{int(time_difference_hours)} hour{'s' if int(time_difference_hours) > 1 else ''} ago"
    elif local_created_at.date() == now_time.date() - timedelta(days=1):
        return "yesterday"
    else:
        return local_created_at.strftime("%Y-%m-%d %H:%M:%S")  

class Adminnotifications(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def get(self, request):
        try:
            notifications = Notification.objects.filter(is_admin_deleted=False)\
                .exclude(notification_type="Password Reset").order_by('-created_at')

            paginator = CustomPaginations()
            paginated_notifications = paginator.paginate_queryset(notifications, request)

            formatted_notifications = []
            for notification in paginated_notifications:
                formatted_notification = {
                    "id": notification.id,
                    "type": notification.notification_type,
                    "message": notification.message,
                    "is_admin_read": notification.is_admin_read,
                    "created_at": get_human_readable_time(notification.created_at),
                    "is_admin_favorite": notification.is_admin_favorite
                }
                formatted_notifications.append(formatted_notification)

            return paginator.get_paginated_response(formatted_notifications)
        
        except Exception as e:
            return Response({"error": f"Internal Server Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteNotificationsAPIView(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def post(self, request, notification_id):
        try:
            notification_to_delete = Notification.objects.get(id=notification_id)
            notification_to_delete.is_admin_deleted = True
            notification_to_delete.save()

            return Response("Notification marked as deleted successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddNotificationToFavorites(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(pk=notification_id)
            notification.toggle_favorite()
            return Response({"message": "Notification added to favorites successfully."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": notification_not_found}, status=status.HTTP_404_NOT_FOUND)



class CustomerNotifications(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get(self, request):
        try:
            user = request.user

            customer = Customer.objects.filter(email=user.email).first()

            if not customer:
                return Response({"error": "Customer not found for the current user."}, status=status.HTTP_404_NOT_FOUND)

            customer_id = customer.id

            customer_notifications = Notification.objects.filter(
                Q(customer_id=customer_id) |
                Q(booking__customer_id=customer_id) |
                Q(payment__booking__customer_id=customer_id),
                is_customer_deleted=False
            ).exclude(notification_type='Customer Registration').order_by('-created_at')

            formatted_customer_notifications = []
            for notification in customer_notifications:
                formatted_notification = {
                    "id": notification.id,
                    "type": notification.notification_type,
                    "message": notification.message,
                    "is_customer_read": notification.is_customer_read,
                    "created_at": get_human_readable_time(notification.created_at),
                    "is_customer_favorite": notification.is_customer_favorite
                }
                if notification.notification_type == "Payment":
                    booking_info = notification.message.split("for booking")[1].strip()
                    formatted_notification["message"] = f"A new payment of {notification.message.split(' ')[5]} has been made for booking {booking_info}"
                formatted_customer_notifications.append(formatted_notification)

            password_reset_notifications = Notification.objects.filter(
                user=user,
                notification_type='Password Reset'
            ).order_by('-created_at')

            formatted_password_reset_notifications = []
            for notification in password_reset_notifications:
                formatted_password_reset_notifications.append({
                    "id": notification.id,
                    "type": notification.notification_type,
                    "message": notification.message,
                    "is_customer_read": notification.is_customer_read,
                    "created_at": get_human_readable_time(notification.created_at),
                    "is_customer_favorite": notification.is_customer_favorite
                })

            all_notifications = formatted_customer_notifications + formatted_password_reset_notifications

            for notification in all_notifications:
                if notification["type"] == "Hotel Booking":
                    notification["message"] = notification["message"].split(" by ")[0]

            paginator = CustomPaginations()
            paginated_data = paginator.paginate_queryset(all_notifications, request)
            
            return paginator.get_paginated_response(paginated_data)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DeleteCustomerNotifications(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def post(self, request, notification_id):
        try:
            notification_to_delete = Notification.objects.get(id=notification_id)
            notification_to_delete.is_customer_deleted = True
            notification_to_delete.save()

            return Response("Notification marked as deleted successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AddCustomerNotificationToFavorites(APIView):
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(pk=notification_id)
            notification.customer_toggle_favorite()
            return Response({"message": "Notification added to favorites successfully."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": notification_not_found}, status=status.HTTP_404_NOT_FOUND)

class ReadCustomernotification(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def post(self, request, notification_id):
        try:
            notification_read = Notification.objects.get(id=notification_id)
            notification_read.is_customer_read = True
            notification_read.save()

            return Response("Notification read successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnreadCustomerNotificationCount(APIView):
    permission_classes = [IsAuthenticated, CustomerPermission]

    def get(self, request):
        unread_count = Notification.objects.filter(is_customer_read=False, customer_id=request.user.id).count()
        return Response({"unread_count": unread_count})

class ReadAdminNotification(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def post(self, request, notification_id):
        try:
            notification_read = Notification.objects.get(id=notification_id)
            notification_read.is_admin_read = True
            notification_read.save()

            return Response("Notification read successfully.", status=status.HTTP_200_OK)

        except Notification.DoesNotExist:
            return Response(notification_not_found, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(f"Internal Server Error: {e}", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UnreadAdminNotificationCount(APIView):
    permission_classes = [IsAuthenticated, AdminPermission]

    def get(self, request):
        unread_count = Notification.objects.filter( is_admin_read=False).count()
        return Response({"unread_count": unread_count})
    

        
