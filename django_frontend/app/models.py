from django.contrib.auth.models import User
from django.db import models


class Currency (models.Model):
    code = models.CharField(max_length=8, verbose_name='ISO 4217 Code', primary_key=True)
    symbol = models.CharField(max_length=8, verbose_name='examples: US$, R$, A$, C$')
    name = models.CharField(max_length=128)
    thousands_separator_symbol = models.CharField(max_length=1)
    decimal_symbol = models.CharField(max_length=1)

    def __str__(self):
        return self.code

    def init(self):
        Currency.objects.update_or_create(
            code='BRL',
            defaults={'symbol': 'R$',
                      'name': 'Real Brasileiro',
                      'thousands_separator_symbol': '.',
                      'decimal_symbol': ','})
        Currency.objects.update_or_create(
            code='USD',
            defaults={'symbol': 'US$',
                      'name': 'United States dollar',
                      'thousands_separator_symbol': ',',
                      'decimal_symbol': '.'})
        Currency.objects.update_or_create(
            code='EUR',
            defaults={'symbol': '€',
                      'name': 'Euro',
                      'thousands_separator_symbol': ',',
                      'decimal_symbol': '.'})
        Currency.objects.update_or_create(
            code='GBP',
            defaults={'symbol': '£',
                      'name': 'Pound sterling',
                      'thousands_separator_symbol': ',',
                      'decimal_symbol': '.'})


class Country (models.Model):
    code = models.CharField(max_length=8, verbose_name='Alpha-2 Code', primary_key=True)
    name = models.CharField(max_length=128, unique=True)
    langId = models.CharField(max_length=8)
    currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.code

    def init(self):
        Country.objects.update_or_create(
            code='BR',
            defaults={'name': 'Brazil',
                      'langId': 'ptBR',
                      'currency': Currency.objects.get(pk='BRL')})
        Country.objects.update_or_create(
            code='PT',
            defaults={'name': 'Portugal',
                      'langId': 'ptBR',
                      'currency': Currency.objects.get(pk='EUR')})
        Country.objects.update_or_create(
            code='US',
            defaults={'name': 'United States of America',
                      'langId': 'enUS',
                      'currency': Currency.objects.get(pk='USD')})
        Country.objects.update_or_create(
            code='GB',
            defaults={'name': 'United Kingdom',
                      'langId': 'enUS',
                      'currency': Currency.objects.get(pk='GBP')})


class Subscription (models.Model):
    name = models.CharField(max_length=32, primary_key=True)
    desc = models.CharField(max_length=512)

    def __str__(self):
        return self.name

    def init(self):
        Subscription.objects.update_or_create(
            name='basic',
            defaults={'desc': 'Basic Subscription'})
        Subscription.objects.update_or_create(
            name='premium',
            defaults={'desc': 'Premium Subscription'})
        Subscription.objects.update_or_create(
            name='platinum',
            defaults={'desc': 'Platinum Subscription'})


class PositionType (models.Model):
    name = models.CharField(max_length=12, unique=True)
    desc = models.CharField(max_length=512, null=True)

    def __str__(self):
        return self.name

    def init(self):
        PositionType.objects.update_or_create(
            name='buy',
            defaults={'desc': 'Buy'})
        PositionType.objects.update_or_create(
            name='sell',
            defaults={'desc': 'Sell'})


class UserCustom (models.Model):
    # Want fields here to be retrieved by Frontend? Add them into UserSerializer (not UserCustomSerializer)
    # UserCustomSerializer is used only for updating UserCustom objects

    last_modified = models.DateTimeField(auto_now=True)
    user = models.OneToOneField(User, related_name='userCustom', on_delete=models.CASCADE)
    birthday = models.DateField(null=True)
    nationality = models.ForeignKey(Country, on_delete=models.DO_NOTHING)
    subscription = models.ForeignKey(Subscription, on_delete=models.DO_NOTHING)
    subscription_expires_on = models.DateField(null=True, db_index=True)
    # prefs
    pref_langId = models.CharField(max_length=8)
    pref_currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.user.username


class Wallet (models.Model):
    owner = models.ForeignKey(User, editable=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    desc = models.CharField(max_length=128, blank=True)
    balance = models.FloatField(default=0.00)
    currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)     # BRL, USD, EUR
    se_short = models.CharField(max_length=32, verbose_name='Stock Exchange Short')

    def __str__(self):
        return self.name


class Position (models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    wallet = models.ForeignKey(Wallet, related_name='positions', on_delete=models.CASCADE)
    type = models.ForeignKey(PositionType, on_delete=models.DO_NOTHING)
    asset_label = models.CharField(max_length=32)
    asset_symbol = models.CharField(max_length=32, db_index=True)
    amount = models.IntegerField()

    started_on = models.DateTimeField(db_index=True)
    s_unit_price = models.FloatField()
    s_operational_cost = models.FloatField(default=0.00)
    s_total_price = models.FloatField()

    ended_on = models.DateTimeField(db_index=True, null=True, default=None)
    e_unit_price = models.FloatField(null=True, default=None)
    e_operational_cost = models.FloatField(null=True, default=None)
    e_total_price = models.FloatField(null=True, default=None)

    def __str__(self):
        return str(self.pk)
