from django.http import HttpResponse
from rest_framework import generics, permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from api_engine.permissions import IsOwner
from api_engine import serializers
from app import models as app_models
from django_engine.functions import generic
from django_engine import settings

from datetime import datetime
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


class StrategyList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return app_models.Strategy.objects.filter(owner=self.request.user)


class StrategyDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = serializers.StrategySerializer

    def get_queryset(self):
        return app_models.Strategy.objects.filter(owner=self.request.user)


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
