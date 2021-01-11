from django.contrib.auth import login, views as django_auth_views
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import render, get_object_or_404
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from knox.settings import knox_settings
from knox.views import LoginView as KnoxLoginView
from rest_auth import views as rest_auth_views
from rest_framework import permissions, status, generics
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from app import models as models_app
from app import models_auth
from app import serializers_auth
from app import views_stripe
from django_engine.functions import utils


def frontend(request):
    return render(request, 'app/index.html')


def frontend_uidb64_token(request, uidb64, token):
    return render(request, 'app/index.html')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def checkUsernameAvailability(request):
    result = {'is_available': None}

    if 'username' in request.data:
        username = request.data['username']

        if User.objects.filter(username=username).exists():
            result['is_available'] = False
        else:
            result['is_available'] = True

    return Response(status=status.HTTP_200_OK, data=result)


class UserRegisterAPIView(generics.GenericAPIView):
    serializer_class = serializers_auth.UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        nationality = get_object_or_404(models_app.Country, pk=request.data['nationality'])
        subscription = get_object_or_404(models_app.Subscription, name='basic')

        if nationality:
            user = serializer.save()

            if user:
                try:
                    userCustom = models_auth.UserCustom.objects.create(
                        user=user,
                        nationality=nationality,
                        subscription=subscription)

                    models_auth.UserPreferences.objects.create(
                        user=user,
                        locale=request.data['locale'],
                        currency=nationality.currency)
                except:
                    user.delete()
                    obj_res = {"message": "Something went wrong. UserCustom could not be created."}
                    return Response(obj_res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                if userCustom:
                    # Send Confirmation Email
                    subject_template_name = 'emails/<locale>/user_created_subject.txt'
                    html_email_template_name = 'emails/<locale>/user_created_email.html'

                    subject_template_name = subject_template_name.replace('<locale>', request.data['locale'])
                    html_email_template_name = html_email_template_name.replace('<locale>', request.data['locale'])

                    current_site = get_current_site(request)
                    context = {
                        'user': user,
                        'protocol': 'https' if request.is_secure() else 'http',
                        'domain': current_site.domain,
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'token': default_token_generator.make_token(user),
                    }

                    obj_res = utils.send_mail(
                        subject_template_name=subject_template_name,
                        email_template_name=html_email_template_name,
                        context=context,
                        to_email=user.email,
                        html_email_template_name=html_email_template_name
                    )
                    if obj_res['status'] == status.HTTP_200_OK:
                        obj_res['result'] = {"message": "User has been created. Confirmation email sent!"}
                    else:
                        obj_res['result'] = {"message": "User has been created, but confirmation email could not be sent."}

                    return Response(data=obj_res['result'], status=obj_res['status'])


class UserRetrieveAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers_auth.UserSerializer

    def get_object(self):
        return self.request.user


class UserUpdateAPIView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers_auth.UserSerializer

    def get_object(self):
        return self.request.user


class UserCustomUpdateAPIView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers_auth.UserCustomSerializer

    def get_object(self):
        return models_auth.UserCustom.objects.get(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()

        if instance.stripe_customer_id:
            views_stripe.update_stripe_customer(instance.stripe_customer_id, serializer.validated_data)


class LoginAPIView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def get_token_limit_per_user(self):
        return knox_settings.TOKEN_LIMIT_PER_USER

    def post(self, request, format=None):
        serializer_data = request.data

        if 'username' in serializer_data:
            # It's a valid log in request
            if '@' in serializer_data['username']:
                # Using email to log in
                user_email = serializer_data['username']
                if User.objects.filter(email=user_email).exists():
                    # Email exists in the database
                    user = User.objects.get(email=user_email)
                    serializer_data['username'] = user.username

        serializer = AuthTokenSerializer(data=serializer_data)

        # Check if user already exists but their email is not confirmed yet
        if User.objects.filter(username=serializer.initial_data['username']).exists():
            user = User.objects.get(username=serializer.initial_data['username'])
            if not user.is_active:
                obj_res = {"email": "User email not confirmed."}
                return Response(obj_res, status=status.HTTP_400_BAD_REQUEST)

        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        login(request, user)
        return super(LoginAPIView, self).post(request, format=None)


INTERNAL_RESET_SESSION_TOKEN = '_password_reset_token'


class RequestPasswordResetView(rest_auth_views.PasswordResetView):
    serializer_class = serializers_auth.RequestPasswordResetSerializer


class RequestEmailConfirmationView(generics.GenericAPIView):
    serializer_class = serializers_auth.RequestEmailConfirmationSerializer

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer_data = request.data

        if 'email' in serializer_data:
            # It's a valid log in request
            if '@' not in serializer_data['email']:
                # Using username...
                username = serializer_data['email']
                if User.objects.filter(username=username).exists():
                    # Username exists in the database
                    user = User.objects.get(username=username)
                    serializer_data['email'] = user.email

        serializer = self.serializer_class(data=serializer_data, context={'request': request})

        user = get_object_or_404(User, email=serializer.initial_data['email'])

        # User is active already?
        if user.is_active:
            return Response()

        # Brings userCustom to get preferred language
        locale = 'ptBR'
        if models_auth.UserCustom.objects.filter(user__email__exact=user.email).exists():
            locale = user.userPrefs.locale

        # Send Confirmation Email
        subject_template_name = 'emails/<locale>/email_confirmation_subject.txt'
        html_email_template_name = 'emails/<locale>/email_confirmation_email.html'

        subject_template_name = subject_template_name.replace('<locale>', locale)
        html_email_template_name = html_email_template_name.replace('<locale>', locale)

        current_site = get_current_site(request)
        context = {
            'user': user,
            'protocol': 'https' if request.is_secure() else 'http',
            'domain': current_site.domain,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
        }

        obj_res = utils.send_mail(
            subject_template_name=subject_template_name,
            email_template_name=html_email_template_name,
            context=context,
            to_email=user.email,
            html_email_template_name=html_email_template_name
        )

        if obj_res['status'] == status.HTTP_200_OK:
            obj_res['result'] = {"message": "Confirmation email sent!"}
        else:
            obj_res['result'] = {"message": "Confirmation email could not be sent."}
        return Response(data=obj_res['result'], status=obj_res['status'])


class ConfirmEmailView(rest_auth_views.PasswordResetConfirmView):
    serializer_class = serializers_auth.ConfirmEmailSerializer


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_update(request):
    user = request.user
    serializer_class = serializers_auth.UserSerializer
    data = request.data

    # All fields in [UserPreferences] are supposed to be updatable
    updatable_fields = [
        'email', 'username', 'first_name', 'last_name',
        'birthday', 'nationality', 'about_me', 'links']
    user_updated = userCustom_updated = userPrefs_updated = None

    for attr, value in data.items():
        if attr in updatable_fields:
            if hasattr(user, attr):
                # User
                user_updated = True
                setattr(user, attr, value)

            elif hasattr(user.userCustom, attr):
                # User Custom
                userCustom_updated = True

                if attr == 'nationality':
                    country = get_object_or_404(models_app.Country, pk=value)
                    setattr(user.userCustom, attr, country)
                else:
                    setattr(user.userCustom, attr, value)

        elif hasattr(user.userPrefs, attr):
            # Preferences
            userPrefs_updated = True

            if attr == 'currency':
                currency = get_object_or_404(models_app.Currency, pk=value)
                setattr(user.userPrefs, attr, currency)
            else:
                setattr(user.userPrefs, attr, value)

    if user_updated:
        user.save()
    if userCustom_updated:
        user.userCustom.save()
    if userPrefs_updated:
        user.userPrefs.save()
        views_stripe.update_stripe_customer(user.userCustom.stripe_customer_id, data)

    serializer = serializer_class(instance=user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_token(request, uidb64, token):
    obj_passwordResetConfirm = django_auth_views.PasswordResetConfirmView()
    reset_url_token = 'set-password'
    user = obj_passwordResetConfirm.get_user(uidb64)

    if user is not None:
        if token == reset_url_token:
            session_token = request.session.get(INTERNAL_RESET_SESSION_TOKEN)
            if obj_passwordResetConfirm.token_generator.check_token(user, session_token):
                # Token is valid
                obj_res = {'message': 'Token is valid.'}
                return Response(obj_res)
            else:
                obj_res = {'message': 'Token is expired.'}
                return Response(obj_res, status=status.HTTP_410_GONE)
        else:
            if obj_passwordResetConfirm.token_generator.check_token(user, token):
                # Token is valid
                obj_res = {'message': 'Token is valid.'}
                return Response(obj_res)
            else:
                obj_res = {'message': 'Token is expired.'}
                return Response(obj_res, status=status.HTTP_410_GONE)
    else:
        obj_res = {'message': 'Token is expired.'}
        return Response(obj_res, status=status.HTTP_410_GONE)