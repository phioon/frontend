from django.http import HttpResponse
from rest_framework import generics, permissions
from api_engine.permissions import IsOwner
from api_engine.serializers import CountrySerializer, CurrencySerializer, \
    SubscriptionSerializer, PositionTypeSerializer, WalletSerializer, PositionSerializer
from app.models import Country, Currency, Subscription, PositionType, Wallet, Position
from django_engine.functions import generic

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
    serializer_class = CountrySerializer
    queryset = Country.objects.all()


class CurrencyList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CurrencySerializer
    queryset = Currency.objects.all()


class SubscriptionList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.all()


class PositionTypeList(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PositionTypeSerializer
    queryset = PositionType.objects.all()


class PositionDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = PositionSerializer

    def get_queryset(self):
        return Position.objects.filter(owner=self.request.user)


class PositionList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = PositionSerializer

    def get_queryset(self):
        dateFrom = self.request.query_params.get('dateFrom')

        if dateFrom is None:
            dateFrom = datetime(year=2001, month=1, day=1, hour=0, minute=0, second=0)
            dateFrom = make_aware(dateFrom)

        return Position.objects.filter(owner=self.request.user, last_modified__gte=dateFrom)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class WalletDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsOwner]
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user)


class WalletList(generics.ListCreateAPIView):
    permission_classes = [IsOwner]
    serializer_class = WalletSerializer

    def get_queryset(self):
        return Wallet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
