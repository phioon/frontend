from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from api_engine.permissions import IsOwner
from api_engine import serializers, paginators
from app import models as app_models
from django_engine.functions import generic
from django_engine import settings

from datetime import datetime, timedelta
from django.utils.timezone import make_aware


__apiKey__ = 'ycjOzOP5loHPPIbfMW6tA7AreqAlq0z4yqxStxk2B8Iwges581rK5V8kIgg4'


# INIT
def app_init(request, apiKey=None):
    if apiKey == __apiKey__:
        generic.app_initiator()
        return HttpResponse()
    else:
        return HttpResponse(status=403)


class CountryList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CountrySerializer
    queryset = app_models.Country.objects.all()


class CurrencyList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CurrencySerializer
    queryset = app_models.Currency.objects.all()


class MyStrategyList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return app_models.Strategy.objects.filter(owner=self.request.user)


class MyStrategyDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return app_models.Strategy.objects.filter(owner=self.request.user)


class SavedSrategyList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        user = self.request.user
        saved_pks = user.saved_strategies.values_list('strategy', flat=True)

        return app_models.Strategy.objects.filter(pk__in=saved_pks)


class StrategyList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer
    pagination_class = paginators.StandardResultsSetPagination

    def get_queryset(self):
        # 1. Payload
        # 1.1 Order by
        if 'order_by' not in self.request.query_params:
            raise serializers.ValidationError({'order_by': 'is missing.'})
        order_by = self.request.query_params['order_by']
        order_by = self.convert_order_by(order_by)

        # 1.2 Filters
        f_keys = f_values = []
        filters = {}
        if 'f_keys' in self.request.query_params:
            if 'f_values' not in self.request.query_params:
                raise serializers.ValidationError({'f_values': 'is missing.'})

            f_keys = self.request.query_params['f_keys'].split(',')
            f_values = self.request.query_params['f_values'].split(',')

            if len(f_keys) != len(f_values):
                raise serializers.ValidationError({'f_keys': 'is expected to have the same size as "f_values".'})

            for x in range(0, len(f_keys)):
                if f_keys[x]:
                    # Key is not empty
                    filters[f_keys[x]] = f_values[x]

        filters['is_public'] = True  # MANDATORY filter.

        # 2. Queryset
        strategies = app_models.Strategy.objects.filter(**filters)
        strategies = strategies.order_by(order_by)
        
        return strategies

    def convert_order_by(self, order_by):
        if 'usage' in order_by:
            order_by = order_by.replace('usage', 'stats__runs_last_14_days')
        elif 'rating' in order_by:
            order_by = order_by.replace('rating', 'stats__rating_avg')
        elif 'saved' in order_by:
            order_by = order_by.replace('saved', 'stats__saved_count')

        return order_by


class StrategyDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return app_models.Strategy.objects.filter(is_public=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_run(request, pk):
    strategy = get_object_or_404(app_models.Strategy, pk=pk)
    strategy.run()

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_rate(request, pk):
    strategy = get_object_or_404(app_models.Strategy, pk=pk)

    if 'rating' not in request.data:
        raise serializers.ValidationError({'rating': 'is missing.'})

    user = request.user
    value = request.data['rating']

    if isinstance(value, int):
        strategy.rate(user=user, value=value)
        return Response(status=status.HTTP_200_OK)

    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_save(request, pk):
    strategy = get_object_or_404(app_models.Strategy, pk=pk)
    user = request.user

    strategy.save_strategy(user)
    return Response()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def strategy_unsave(request, pk):
    strategy = get_object_or_404(app_models.Strategy, pk=pk)
    user = request.user

    strategy.unsave_strategy(user)
    return Response()


class SubscriptionList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.SubscriptionSerializer
    queryset = app_models.Subscription.objects.all()


class PositionTypeList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.PositionTypeSerializer
    queryset = app_models.PositionType.objects.all()


class PositionList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.PositionSerializer

    def get_queryset(self):
        dateFrom = self.request.query_params.get('dateFrom')

        if dateFrom is None:
            dateFrom = datetime(year=2001, month=1, day=1, hour=0, minute=0, second=0)
            dateFrom = make_aware(dateFrom)

        return app_models.Position.objects.filter(owner=self.request.user, last_modified__gte=dateFrom)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PositionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.PositionSerializer

    def get_queryset(self):
        return app_models.Position.objects.filter(owner=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_retrieve(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = serializers.UserProfileSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_follow(request, username):
    following_user = get_object_or_404(User, username=username)
    user = request.user

    is_follower = app_models.UserFollowing.objects.filter(user=user, following_user=following_user)
    is_follower = is_follower.count() > 0

    if not is_follower:
        app_models.UserFollowing.objects.create(user=user, following_user=following_user)

    serializer = serializers.UserProfileSerializer(following_user, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_unfollow(request, username):
    following_user = get_object_or_404(User, username=username)
    user = request.user

    app_models.UserFollowing.objects.filter(user=user, following_user=following_user).delete()

    serializer = serializers.UserProfileSerializer(following_user, context={'request': request})
    return Response(serializer.data)


class WalletList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.WalletSerializer

    def get_queryset(self):
        return app_models.Wallet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WalletDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.WalletSerializer

    def get_queryset(self):
        return app_models.Wallet.objects.filter(owner=self.request.user)


# On-demand
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def run_stock_split(request, symbol, split_date='2001-01-01', split_into=1, apiKey=None):
    if apiKey == settings.API_KEY:
        positions = app_models.Position.objects.filter(asset_symbol=symbol, started_on__lte=split_date)

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
