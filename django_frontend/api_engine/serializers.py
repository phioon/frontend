from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import exceptions

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from rest_auth import serializers as rest_auth_serializers

from django.utils.http import urlsafe_base64_decode as uid_decoder
from django.utils.encoding import force_text
from django.utils import timezone
from datetime import datetime

from app.models import Country, Currency, Subscription, Position, PositionType, UserCustom, Wallet


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


class PositionSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Position
        fields = '__all__'

    # Confirms requestor's ownership on wallet
    def validate_wallet(self, value):
        requestor = self.context['request'].user
        walletOwner = value.owner

        if requestor != walletOwner:
            raise serializers.ValidationError("This wallet is not yours.")
        return value

    def validate_ended_on(self, value):
        started_on = None
        if 'started_on' in self.initial_data:
            started_on = datetime.strptime(self.initial_data['started_on'], '%Y-%m-%d %H:%M:%S')
            started_on = timezone.make_aware(started_on, timezone.utc)
        else:
            started_on = self.context['view'].get_object().started_on

        if started_on > value:
            raise serializers.ValidationError("Must be greater than started_on.")
        return value


class PositionTypeSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = PositionType
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'


class WalletSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    positions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = '__all__'

    def create(self, validated_data):
        requestor = self.context['request'].user
        subscriptionPlan = Subscription.objects.get(usercustom__user=requestor)

        if subscriptionPlan.name == 'basic':
            walletAmount = Wallet.objects.filter(owner=requestor).count()
            if walletAmount >= 3:
                raise serializers.ValidationError("Wallet's limit reached.")

        wallet = Wallet.objects.create(
            owner=requestor,
            name=validated_data['name'],
            desc=validated_data['desc'],
            balance=validated_data['balance'],
            currency=validated_data['currency'],
            se_short=validated_data['se_short'])

        return wallet


# Auth
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
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


class UserSerializer(serializers.ModelSerializer):
    birthday = serializers.ReadOnlyField(source='userCustom.birthday')
    nationality = serializers.ReadOnlyField(source='userCustom.nationality.code')
    subscription = serializers.ReadOnlyField(source='userCustom.subscription.name')
    subscription_expires_on = serializers.ReadOnlyField(source='userCustom.subscription_expires_on')
    pref_currency = serializers.ReadOnlyField(source='userCustom.pref_currency.code')
    pref_langId = serializers.ReadOnlyField(source='userCustom.pref_langId')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'birthday', 'nationality', 'subscription', 'subscription_expires_on',
                  'pref_langId', 'pref_currency']
        read_only_fields = ['username', 'email']


class UserCustomSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCustom
        fields = '__all__'


class RequestPasswordResetSerializer(rest_auth_serializers.PasswordResetSerializer):
    def get_email_options(self):
        subject_template_name = 'emails/<langId>/password_reset_subject.txt'
        html_email_template_name = 'emails/<langId>/password_reset_email.html'

        user_email = self.validated_data['email']

        try:
            userCustom = UserCustom.objects.get(user__username__exact=user_email)
            pref_langId = userCustom.pref_langId
            subject_template_name = subject_template_name.replace('<langId>', pref_langId)
            html_email_template_name = html_email_template_name.replace('<langId>', pref_langId)
        except exceptions.ObjectDoesNotExist:
            pass

        return {
            'subject_template_name': subject_template_name,
            'email_template_name': html_email_template_name,
            'html_email_template_name': html_email_template_name,
        }


class RequestEmailConfirmationSerializer(rest_auth_serializers.PasswordResetSerializer):
    def get_email_options(self):
        subject_template_name = 'emails/<langId>/confirm_email_subject.txt'
        html_email_template_name = 'emails/<langId>/confirm_email_email.html'

        user_email = self.validated_data['email']
        userCustom = UserCustom.objects.get(user__username__exact=user_email)
        pref_langId = userCustom.pref_langId

        subject_template_name = subject_template_name.replace('<langId>', pref_langId)
        html_email_template_name = html_email_template_name.replace('<langId>', pref_langId)

        return {
            'subject_template_name': subject_template_name,
            'email_template_name': html_email_template_name,
            'html_email_template_name': html_email_template_name,
        }


class ConfirmEmailSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

    def validate(self, attrs):
        self._errors = {}

        # Decode the uidb64 to uid to get User object
        try:
            uid = force_text(uid_decoder(attrs['uid']))
            self.user = User._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({'uid': ['Invalid value']})

        if not default_token_generator.check_token(self.user, attrs['token']):
            raise ValidationError({'token': ['Invalid value']})

        return attrs

    def save(self):
        self.user.is_active = True
        self.user.save()
