from django.contrib.auth.models import User
from rest_framework import serializers

from django.utils import timezone
from datetime import datetime

from app import models


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Country
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Currency
        fields = '__all__'


class PositionSerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = models.Position
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
        model = models.PositionType
        fields = '__all__'


class StrategySerializer(serializers.ModelSerializer):
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    owner_username = serializers.ReadOnlyField(source='owner.username')
    my_rating = serializers.SerializerMethodField()

    class Meta:
        model = models.Strategy
        fields = '__all__'

    def create(self, validated_data):
        instance = models.Strategy.objects.create(**validated_data)
        models.StrategyStats.objects.create(strategy=instance)      # Create stats instance

        return instance

    def update(self, instance, validated_data):
        requestor = self.context['request'].user

        if instance.owner != requestor:
            raise serializers.ValidationError("You must be owner to update a Strategy.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_my_rating(self, obj):
        requestor = self.context['request'].user
        my_rating = requestor.ratings.filter(strategy=obj)
        if my_rating.exists():
            my_rating = my_rating[0].rating
        else:
            my_rating = None

        return my_rating


class StrategyDetailSerializer(serializers.ModelSerializer):
    id = serializers.HiddenField(default=None)
    owner = serializers.HiddenField(default=serializers.CurrentUserDefault())
    owner_username = serializers.ReadOnlyField(source='owner.username')
    my_rating = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        model = models.Strategy
        fields = '__all__'

    def get_my_rating(self, obj):
        requestor = self.context['request'].user
        my_rating = requestor.ratings.filter(strategy=obj)
        if my_rating.exists():
            my_rating = my_rating[0].rating
        else:
            my_rating = None

        return my_rating

    def get_stats(self, obj):
        return obj.stats


class StrategyReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = models.StrategyRating
        fields = ['last_modified', 'username', 'full_name', 'rating', 'review']

    def get_full_name(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name
        full_name = str(first_name + ' ' + last_name)
        return full_name


class SubscriptionSerializer(serializers.ModelSerializer):
    prices = serializers.SerializerMethodField()

    class Meta:
        model = models.Subscription
        fields = '__all__'

    def get_prices(self, obj):
        prices = {}
        for price in obj.prices.filter(is_active=True):
            prices[price.name] = price.id
        return prices


class UserProfileSerializer(serializers.ModelSerializer):
    about_me = serializers.ReadOnlyField(source='userCustom.about_me')
    links = serializers.ReadOnlyField(source='userCustom.links')
    subscription = serializers.ReadOnlyField(source='userCustom.subscription.name')

    strategies = serializers.SerializerMethodField()
    amount_following = serializers.SerializerMethodField()
    amount_followers = serializers.SerializerMethodField()
    is_a_follower = serializers.SerializerMethodField()
    is_followed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'about_me',
                  'links', 'subscription',
                  'amount_following', 'amount_followers', 'is_a_follower', 'is_followed_by_me', 'strategies']

    def get_is_a_follower(self, obj):
        requestor = self.context['request'].user
        is_a_follower = obj.following.filter(following_user=requestor).exists()
        return is_a_follower

    def get_is_followed_by_me(self, obj):
        requestor = self.context['request'].user
        is_followed_by_me = obj.followers.filter(user=requestor).exists()
        return is_followed_by_me

    def get_amount_following(self, obj):
        return obj.following.count()

    def get_amount_followers(self, obj):
        return obj.followers.count()

    def get_strategies(self, obj):
        strategies = obj.strategies.filter(is_public=True)
        serializer = StrategyDetailSerializer(strategies, many=True, context={'request': self.context['request']})
        return serializer.data


class UserFollowerSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    full_name = serializers.SerializerMethodField()
    is_followed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = models.UserFollowing
        fields = ['username', 'full_name', 'is_followed_by_me']

    def get_full_name(self, obj):
        first_name = obj.user.first_name
        last_name = obj.user.last_name
        full_name = str(first_name + ' ' + last_name)
        return full_name

    def get_is_followed_by_me(self, obj):
        requestor = self.context['request'].user
        is_followed_by_me = requestor.following.filter(following_user=obj.user).exists()
        return is_followed_by_me


class UserFollowingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='following_user.username')
    full_name = serializers.SerializerMethodField()
    is_followed_by_me = serializers.SerializerMethodField()

    class Meta:
        model = models.UserFollowing
        fields = ['username', 'full_name', 'is_followed_by_me']

    def get_full_name(self, obj):
        first_name = obj.following_user.first_name
        last_name = obj.following_user.last_name
        full_name = str(first_name + ' ' + last_name)
        return full_name

    def get_is_followed_by_me(self, obj):
        requestor = self.context['request'].user
        is_followed_by_me = requestor.following.filter(following_user=obj.following_user).exists()
        return is_followed_by_me


class WalletSerializer(serializers.ModelSerializer):
    positions = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = models.Wallet
        fields = '__all__'

    def create(self, validated_data):
        requestor = self.context['request'].user
        subscriptionPlan = models.Subscription.objects.get(usercustom__user=requestor)

        if subscriptionPlan.name == 'basic':
            walletAmount = models.Wallet.objects.filter(owner=requestor).count()
            if walletAmount >= 2:
                raise serializers.ValidationError("Wallets limit reached.")

        instance = models.Wallet.objects.create(**validated_data)
        return instance