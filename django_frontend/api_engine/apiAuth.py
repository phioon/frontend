from . import utils
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from django.contrib.auth import login, views as django_auth_views, models as django_auth_models
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes

from rest_auth import views as rest_auth_views

from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from knox.views import LoginView as KnoxLoginView
from knox.settings import knox_settings

from .serializers import UserSerializer, UserRegisterSerializer, UserCustomSerializer
from . import serializers

from app.models import Country, UserCustom, Subscription


# User
class UserRegisterAPIView(generics.GenericAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        nationality = get_object_or_404(Country, pk=request.data['nationality'])
        subscription = get_object_or_404(Subscription, name='basic')

        if nationality:
            user = serializer.save()

            if user:
                try:
                    userCustom = UserCustom.objects.create(
                        user=user,
                        nationality=nationality,
                        subscription=subscription,
                        pref_currency=nationality.currency,
                        pref_langId=request.data['langId'])
                except:
                    user.delete()
                    obj_res = {"message": "Something went wrong. UserCustom couldn't be created."}
                    return Response(obj_res, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                if userCustom:
                    # Send Confirmation Email
                    subject_template_name = 'emails/<langId>/user_created_subject.txt'
                    html_email_template_name = 'emails/<langId>/user_created_email.html'

                    subject_template_name = subject_template_name.replace('<langId>', request.data['langId'])
                    html_email_template_name = html_email_template_name.replace('<langId>', request.data['langId'])

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
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserUpdateAPIView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# User Custom
class UserCustomUpdateAPIView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserCustomSerializer

    def get_object(self):
        return UserCustom.objects.get(user=self.request.user)


class LoginAPIView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def get_token_limit_per_user(self):
        return knox_settings.TOKEN_LIMIT_PER_USER

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)

        # Check if user already exists but their email is not confirmed yet
        user = django_auth_models.User.objects.get(username=serializer.initial_data['username'])
        if user and not user.is_active:
            obj_res = {"email": "User email not confirmed."}
            return Response(obj_res, status=status.HTTP_400_BAD_REQUEST)

        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        login(request, user)
        return super(LoginAPIView, self).post(request, format=None)


#Tokens
INTERNAL_RESET_SESSION_TOKEN = '_password_reset_token'


class RequestPasswordResetView(rest_auth_views.PasswordResetView):
    serializer_class = serializers.RequestPasswordResetSerializer


class RequestEmailConfirmationView(generics.GenericAPIView):
    serializer_class = serializers.RequestEmailConfirmationSerializer

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})

        try:
            user = django_auth_models.User.objects.get(username=serializer.initial_data['email'])
        except django_auth_models.User.DoesNotExist:
            return Response()

        # User is active already?
        if user.is_active:
            return Response()

        # Brings userCustom to get preferred language
        userCustom = UserCustom.objects.get(user__username__exact=user.email)
        langId = "enUS"

        if userCustom:
            langId = userCustom.pref_langId

        # Send Confirmation Email
        subject_template_name = 'emails/<langId>/email_confirmation_subject.txt'
        html_email_template_name = 'emails/<langId>/email_confirmation_email.html'

        subject_template_name = subject_template_name.replace('<langId>', langId)
        html_email_template_name = html_email_template_name.replace('<langId>', langId)

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
    serializer_class = serializers.ConfirmEmailSerializer


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def CheckToken(request, uidb64, token):
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
