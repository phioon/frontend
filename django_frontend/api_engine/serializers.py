from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from rest_auth import serializers as rest_auth_serializers

from django.utils.http import urlsafe_base64_decode as uid_decoder
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_text
from django.utils import timezone
from datetime import datetime, timedelta

from app import models as app_models
from app.models import Country, Currency, Strategy, Subscription, Position, PositionType, UserCustom, Wallet


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
            raise serializers.ValidationError("You must be owner to update a Position.")
        return value

    def validate_ended_on(self, value):
        started_on = None
        if 'started_on' in self.initial_data:
            started_on = datetime.strptime(self.initial_data['started_on'], '%Y-%m-%d %H:%M:%S')
            started_on = timezone.make_aware(started_on, timezone.utc)
        else:
            started_on = self.context['view'].get_object().started_on

        if value and started_on > value:
            raise serializers.ValidationError("Must be greater than started_on.")
        return value


class PositionTypeSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = PositionType
        fields = '__all__'


class StrategySerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Strategy
        fields = '__all__'

    def create(self, validated_data):
        instance = app_models.Strategy.objects.create(**validated_data)
        app_models.StrategyStats.objects.create(strategy=instance)      # Create stats instance

        return instance

    def update(self, instance, validated_data):
        requestor = self.context['request'].user

        if instance.owner != requestor:
            raise serializers.ValidationError("You must be owner to update a Strategy.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class StrategyDetailSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    owner_username = serializers.ReadOnlyField(source='owner.username')
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Strategy
        fields = '__all__'

    def get_stats(self, obj):
        return obj.get_stats()


class SubscriptionSerializer(serializers.ModelSerializer):
    prices = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = '__all__'

    def get_prices(self, obj):
        prices = {}
        for price in obj.prices.filter(is_active=True):
            prices[price.name] = price.id
        return prices


class UserProfileSerializer(serializers.ModelSerializer):
    subscription = serializers.ReadOnlyField(source='userCustom.subscription.name')
    strategies = serializers.SerializerMethodField()
    is_followed_by_me = serializers.SerializerMethodField()
    amount_following = serializers.SerializerMethodField()
    amount_followers = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'subscription',
                  'is_followed_by_me', 'amount_following', 'amount_followers', 'strategies']

    def get_is_followed_by_me(self, obj):
        requestor = self.context['request'].user
        is_followed_by_me = obj.followers.filter(user=requestor)
        is_followed_by_me = is_followed_by_me.count() > 0
        return is_followed_by_me

    def get_amount_following(self, obj):
        return obj.following.count()

    def get_amount_followers(self, obj):
        return obj.followers.count()

    def get_strategies(self, obj):
        strategies = obj.strategies.filter(is_public=True)
        serializer = StrategyDetailSerializer(strategies, many=True)
        return serializer.data


class FollowingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='following_user.username')
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = app_models.UserFollowing
        fields = ['username', 'full_name']

    def get_full_name(self, obj):
        first_name = obj.following_user.first_name
        last_name = obj.following_user.last_name
        full_name = str(first_name + ' ' + last_name)
        return full_name


class FollowersSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = app_models.UserFollowing
        fields = ['username', 'full_name']

    def get_full_name(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name
        full_name = str(first_name + ' ' + last_name)
        return full_name


class WalletSerializer(serializers.ModelSerializer):
    positions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = '__all__'

    def create(self, validated_data):
        requestor = self.context['request'].user
        subscriptionPlan = Subscription.objects.get(usercustom__user=requestor)

        if subscriptionPlan.name == 'basic':
            walletAmount = Wallet.objects.filter(owner=requestor).count()
            if walletAmount >= 2:
                raise serializers.ValidationError("Wallets limit reached.")

        instance = Wallet.objects.create(**validated_data)
        return instance


# Auth
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
        try:
            user = User.objects.get(email=value)
            raise ValidationError({'email': 'A user with that email already exists.'})
        except User.DoesNotExist:
            return value


class UserSerializer(serializers.ModelSerializer):
    birthday = serializers.ReadOnlyField(source='userCustom.birthday')
    nationality = serializers.ReadOnlyField(source='userCustom.nationality.code')
    subscription = serializers.SerializerMethodField()
    prefs = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'date_joined', 'birthday', 'nationality',
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
        model = UserCustom
        fields = ['birthday', 'nationality']


class RequestPasswordResetSerializer(rest_auth_serializers.PasswordResetSerializer):
    def get_email_options(self):
        subject_template_name = 'emails/<locale>/password_reset_subject.txt'
        html_email_template_name = 'emails/<locale>/password_reset_email.html'

        user_email = self.validated_data['email']

        user = get_object_or_404(User, email=user_email)
        locale = user.userPrefs.locale
        subject_template_name = subject_template_name.replace('<locale>', locale)
        html_email_template_name = html_email_template_name.replace('<locale>', locale)

        print('subject_template_name: %s' % subject_template_name)
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
