from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import get_object_or_404, render

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from django.utils.timezone import make_aware
from datetime import datetime

from app import models, serializers, paginators
from app.permissions import IsOwner
from django_engine import settings
from django_engine.functions import utils, generic

__apiKey__ = 'ycjOzOP5loHPPIbfMW6tA7AreqAlq0z4yqxStxk2B8Iwges581rK5V8kIgg4'


def frontend(request):
    return render(request, 'app/index.html')


# Init
def app_init(request, apiKey=None):
    if apiKey == __apiKey__:
        generic.app_initiator()
        return Response()
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)


class CountryList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CountrySerializer
    queryset = models.Country.objects.all()


class CurrencyList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CurrencySerializer
    queryset = models.Currency.objects.all()


class MyStrategyList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return models.Strategy.objects.filter(owner=self.request.user)


class MyStrategyDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return models.Strategy.objects.filter(owner=self.request.user)


class SavedSrategyList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        user = self.request.user
        saved_pks = user.saved_strategies.values_list('strategy', flat=True)

        return models.Strategy.objects.filter(pk__in=saved_pks)


class StrategyList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer
    pagination_class = paginators.StandardPageNumberPagination

    def get_queryset(self):
        # 1. Payload
        # 1.1 Order by
        if 'order_by' not in self.request.query_params:
            raise ValidationError({'order_by': 'is missing.'})
        order_by = self.request.query_params['order_by']
        order_by = self.convert_order_by(order_by)

        # 1.2 Filters
        f_keys = f_values = []
        filters = {}
        if 'f_keys' in self.request.query_params:
            if 'f_values' not in self.request.query_params:
                raise ValidationError({'f_values': 'is missing.'})

            f_keys = self.request.query_params['f_keys'].split(',')
            f_values = self.request.query_params['f_values'].split(',')

            if len(f_keys) != len(f_values):
                raise ValidationError({'f_keys': 'is expected to have the same size as "f_values".'})

            for x in range(0, len(f_keys)):
                if f_keys[x]:
                    # Key is not empty
                    filters[f_keys[x]] = f_values[x]

        filters['is_public'] = True  # MANDATORY filter.

        # 2. Queryset
        strategies = models.Strategy.objects.filter(**filters)
        strategies = strategies.order_by(order_by)

        return strategies

    def convert_order_by(self, order_by):
        if 'usage' in order_by:
            order_by = order_by.replace('usage', 'statistics__runs_last_14_days')
        elif 'rating' in order_by:
            order_by = order_by.replace('rating', 'statistics__rating_avg')
        elif 'saved' in order_by:
            order_by = order_by.replace('saved', 'statistics__saved_count')

        return order_by


class StrategyReviewList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategyReviewSerializer
    pagination_class = paginators.ReviewCursorPagination
    lookup_url_kwarg = 'uuid'

    def get_queryset(self):
        uuid = self.kwargs.get(self.lookup_url_kwarg)
        strategy = get_object_or_404(models.Strategy, uuid=uuid)
        return strategy.ratings.exclude(Q(review__isnull=True) | Q(review=''))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def strategy_retrieve(request, uuid):
    is_valid = utils.is_valid_uuid(uuid)
    if not is_valid:
        return Response(status=status.HTTP_404_NOT_FOUND)

    strategy = get_object_or_404(models.Strategy, uuid=uuid)

    if strategy.is_public:
        serializer = serializers.StrategyDetailSerializer(strategy, context={'request': request})
        return Response(serializer.data)

    res_obj = {'detail': 'not found'}
    return Response(data=res_obj, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_rate(request, uuid):
    strategy = get_object_or_404(models.Strategy, uuid=uuid)
    user = request.user

    if 'rating' not in request.data:
        raise ValidationError({'rating': 'is missing.'})

    obj = {'rating': request.data['rating']}
    if 'review' in request.data:
        obj['review'] = request.data['review']

    if isinstance(obj['rating'], int):
        strategy.rate(user=user, obj=obj)
        return Response(status=status.HTTP_200_OK)

    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_run(request, uuid):
    strategy = get_object_or_404(models.Strategy, uuid=uuid)
    strategy.run()
    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_save(request, uuid):
    strategy = get_object_or_404(models.Strategy, uuid=uuid)
    user = request.user

    strategy.save_strategy(user)
    return Response()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_unsave(request, uuid):
    strategy = get_object_or_404(models.Strategy, uuid=uuid)
    user = request.user

    strategy.unsave_strategy(user)
    return Response()


class SubscriptionList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.SubscriptionSerializer
    queryset = models.Subscription.objects.all()


class PositionTypeList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.PositionTypeSerializer
    queryset = models.PositionType.objects.all()


class PositionList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.PositionSerializer

    def get_queryset(self):
        dateFrom = self.request.query_params.get('dateFrom')

        if dateFrom is None:
            dateFrom = datetime(year=2001, month=1, day=1, hour=0, minute=0, second=0)
            dateFrom = make_aware(dateFrom)

        return models.Position.objects.filter(owner=self.request.user, last_modified__gte=dateFrom)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PositionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.PositionSerializer

    def get_queryset(self):
        return models.Position.objects.filter(owner=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_retrieve(request, username):
    user = get_object_or_404(models.User, username=username)

    serializer = serializers.UserProfileSerializer(user, context={'request': request})
    return Response(serializer.data)


class UserFollowerList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.UserFollowerSerializer
    pagination_class = paginators.FollowingCursorPagination
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        username = self.kwargs.get(self.lookup_url_kwarg)
        user = get_object_or_404(models.User, username=username)
        return user.followers.all()


class UserFollowingList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.UserFollowingSerializer
    pagination_class = paginators.FollowingCursorPagination
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        username = self.kwargs.get(self.lookup_url_kwarg)
        user = get_object_or_404(models.User, username=username)
        return user.following.all()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_follow(request, username):
    following_user = get_object_or_404(User, username=username)
    user = request.user

    is_follower = models.UserFollowing.objects.filter(user=user, following_user=following_user)
    is_follower = is_follower.count() > 0

    if not is_follower:
        models.UserFollowing.objects.create(user=user, following_user=following_user)

    serializer_user = serializers.UserProfileSerializer(user, context={'request': request})
    serializer_following_user = serializers.UserProfileSerializer(following_user, context={'request': request})
    obj_res = {
        'user': serializer_user.data,
        'following_user': serializer_following_user.data
    }
    return Response(obj_res)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_unfollow(request, username):
    following_user = get_object_or_404(User, username=username)
    user = request.user

    models.UserFollowing.objects.filter(user=user, following_user=following_user).delete()

    serializer_user = serializers.UserProfileSerializer(user, context={'request': request})
    serializer_following_user = serializers.UserProfileSerializer(following_user, context={'request': request})
    obj_res = {
        'user': serializer_user.data,
        'following_user': serializer_following_user.data
    }
    return Response(obj_res)


class WalletList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.WalletSerializer

    def get_queryset(self):
        return models.Wallet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WalletDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.WalletSerializer

    def get_queryset(self):
        return models.Wallet.objects.filter(owner=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def run_stock_split(request, symbol, split_date='2001-01-01', split_into=1, apiKey=None):
    if apiKey == settings.API_KEY:
        positions = models.Position.objects.filter(asset_symbol=symbol, started_on__lte=split_date)

        for position in positions:
            position.amount = position.amount * split_into
            position.s_unit_price = round(position.s_unit_price / split_into, 2)

            if position.ended_on:
                position.e_unit_price = round(position.e_unit_price / split_into, 2)
            position.save()

        obj_res = {'message': "Positions updated: %s" % positions}
        return Response(obj_res)
    else:
        return Response(status=status.HTTP_403_FORBIDDEN)