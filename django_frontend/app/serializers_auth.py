from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode as uid_decoder
from rest_auth import serializers as rest_auth_serializers
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from app import models_auth
from app import views_auth


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'first_name', 'last_name']
        write_only_fields = ['password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'].lower(),
            email=validated_data['email'].lower(),
            password=validated_data['password'],
            first_name=validated_data['first_name'].title(),
            last_name=validated_data['last_name'].title(),
            is_active=False)

        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError({'email': 'A user with that email already exists.'})
        return value


class UserSerializer(serializers.ModelSerializer):
    about_me = serializers.ReadOnlyField(source='userCustom.about_me')
    links = serializers.ReadOnlyField(source='userCustom.links')
    birthday = serializers.ReadOnlyField(source='userCustom.birthday')
    nationality = serializers.ReadOnlyField(source='userCustom.nationality.code')
    subscription = serializers.SerializerMethodField()
    prefs = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined',
                  'about_me', 'links', 'birthday', 'nationality',
                  'subscription', 'prefs']

    def get_subscription(self, obj):
        subscription = {
            'name': obj.userCustom.subscription.name,
            'status': obj.userCustom.subscription_status,
            'expires_on': obj.userCustom.subscription_expires_on,
            'renews_on': obj.userCustom.subscription_renews_on,
        }
        return subscription

    def get_prefs(self, obj):
        prefs = {}

        for field_name in obj.userPrefs.get_field_list():
            attrValue = getattr(obj.userPrefs, field_name)

            if field_name == 'currency':
                prefs[field_name] = attrValue.code
            else:
                prefs[field_name] = attrValue
        return prefs


class UserCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = models_auth.UserCustom
        fields = ['about_me', 'links', 'birthday', 'nationality']


class RequestPasswordResetSerializer(rest_auth_serializers.PasswordResetSerializer):
    def get_email_options(self):
        subject_template_name = 'emails/<locale>/password_reset_subject.txt'
        html_email_template_name = 'emails/<locale>/password_reset_email.html'

        user_email = self.validated_data['email']

        user = get_object_or_404(User, email=user_email)
        locale = user.userPrefs.locale
        subject_template_name = subject_template_name.replace('<locale>', locale)
        html_email_template_name = html_email_template_name.replace('<locale>', locale)

        return {
            'subject_template_name': subject_template_name,
            'email_template_name': html_email_template_name,
            'html_email_template_name': html_email_template_name,
        }


class RequestEmailConfirmationSerializer(rest_auth_serializers.PasswordResetSerializer):
    email = serializers.EmailField()


class ConfirmEmailSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        self._errors = {}
        request = self.context['request']._request      # Django HttpRequest instance

        # Decode the uidb64 to uid to get User object
        try:
            uid = force_text(uid_decoder(attrs['uid']))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({'uid': ['Invalid value']})

        if not views_auth.check_token(request, self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})

        return attrs

    def save(self):
        self.user.is_active = True
        self.user.save()
