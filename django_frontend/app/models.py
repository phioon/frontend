from django.contrib.auth.models import User
from django.db.models import Avg, Sum
from django.core import validators
from django.db import models
from datetime import datetime, timedelta
import json


class Currency(models.Model):
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
            defaults={'symbol': '$',
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


class Country(models.Model):
    code = models.CharField(max_length=8, verbose_name='Alpha-2 Code', primary_key=True)
    name = models.CharField(max_length=128, unique=True)
    locale = models.CharField(max_length=8)
    currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.code

    def init(self):
        Country.objects.update_or_create(
            code='BR',
            defaults={'name': 'Brazil',
                      'locale': 'ptBR',
                      'currency': Currency.objects.get(pk='BRL')})
        Country.objects.update_or_create(
            code='PT',
            defaults={'name': 'Portugal',
                      'locale': 'ptBR',
                      'currency': Currency.objects.get(pk='EUR')})
        Country.objects.update_or_create(
            code='US',
            defaults={'name': 'United States of America',
                      'locale': 'enUS',
                      'currency': Currency.objects.get(pk='USD')})
        Country.objects.update_or_create(
            code='GB',
            defaults={'name': 'United Kingdom',
                      'locale': 'enUS',
                      'currency': Currency.objects.get(pk='GBP')})


class Subscription(models.Model):
    name = models.CharField(max_length=32, primary_key=True)
    label = models.CharField(max_length=32)

    def __str__(self):
        return self.name

    def init(self):
        Subscription.objects.update_or_create(
            name='basic',
            defaults={'label': 'Basic'})
        Subscription.objects.update_or_create(
            name='premium',
            defaults={'label': 'Premium'})
        Subscription.objects.update_or_create(
            name='platinum',
            defaults={'label': 'Platinum'})


class SubscriptionPrice(models.Model):
    # Remember to update prices here accordingly to Stripe's platform.
    # Otherwise, the webhook_listener will not be able to address the correct subscription to the users.

    id = models.CharField(max_length=64, primary_key=True)
    subscription = models.ForeignKey(Subscription, related_name='prices', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=64)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def init(self):
        premium = Subscription.objects.get(name='premium')
        platinum = Subscription.objects.get(name='platinum')

        SubscriptionPrice.objects.update_or_create(
            id='STRIPE_PRICE_ID_1',
            defaults={'subscription': premium, 'name': 'premium_month'})
        SubscriptionPrice.objects.update_or_create(
            id='STRIPE_PRICE_ID_2',
            defaults={'subscription': premium, 'name': 'premium_year'})
        SubscriptionPrice.objects.update_or_create(
            id='STRIPE_PRICE_ID_3',
            defaults={'subscription': platinum, 'name': 'platinum_month'})
        SubscriptionPrice.objects.update_or_create(
            id='STRIPE_PRICE_ID_4',
            defaults={'subscription': platinum, 'name': 'platinum_year'})


class PositionType(models.Model):
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


class UserCustom(models.Model):
    # Want fields here to be retrieved by Frontend? Add them into UserSerializer (not UserCustomSerializer)
    # UserCustomSerializer is used only for updating UserCustom objects

    last_modified = models.DateTimeField(auto_now=True)
    user = models.OneToOneField(User, related_name='userCustom', on_delete=models.CASCADE)
    birthday = models.DateField(null=True)
    nationality = models.ForeignKey(Country, on_delete=models.DO_NOTHING)
    stripe_customer_id = models.CharField(max_length=32, null=True, unique=True)
    # subscription
    subscription = models.ForeignKey(Subscription, on_delete=models.DO_NOTHING)
    subscription_status = models.CharField(max_length=16, default='undefined')
    subscription_expires_on = models.DateField(null=True, db_index=True)
    subscription_renews_on = models.DateField(null=True, db_index=True)

    def __str__(self):
        return self.user.username


class UserFollowing(models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    following_user = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'following_user'])
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'following_user'], name='unique_followers')
        ]


class UserPreferences(models.Model):
    user = models.OneToOneField(User, related_name='userPrefs', on_delete=models.CASCADE)
    locale = models.CharField(max_length=8)
    currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.user.username

    def get_field_list(self):
        fields = []

        ignore_fields = ['id', 'user']
        for field in self._meta.fields:
            if field.name not in ignore_fields:
                fields.append(field.name)

        return fields


class Wallet(models.Model):
    owner = models.ForeignKey(User, editable=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    desc = models.CharField(max_length=128, blank=True)
    balance = models.FloatField(default=0.00)
    currency = models.ForeignKey(Currency, on_delete=models.DO_NOTHING)     # BRL, USD, EUR
    se_short = models.CharField(max_length=32, verbose_name='Stock Exchange Short')

    def __str__(self):
        return self.name


class Position(models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, editable=False, on_delete=models.CASCADE)
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


class Strategy(models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    owner = models.ForeignKey(User, related_name='strategies', editable=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    desc = models.CharField(max_length=2048, blank=True)
    type = models.CharField(max_length=8, verbose_name='buy or sell')

    is_public = models.BooleanField(default=True, verbose_name='Visibility')
    is_dynamic = models.BooleanField(default=False, verbose_name='Logic type')
    rules = models.JSONField()
    tags = models.JSONField(default=list())

    def __str__(self):
        return str(self.pk)

    def rate(self, user, value):
        try:
            # Try to update instance...
            instance = StrategyRating.objects.get(strategy=self, user=user)
            instance.rating = value
            instance.save()
        except StrategyRating.DoesNotExist:
            instance = StrategyRating.objects.create(strategy=self, user=user, rating=value)

        self.update_stats('ratings')

        return instance

    def run(self):
        today = datetime.utcnow().date()

        try:
            # Try to update instance...
            instance = StrategyUsage.objects.get(strategy=self, date=today)
            instance.runs = instance.runs + 1
            instance.save()
        except StrategyUsage.DoesNotExist:
            # Instance doesn't exist, so create it...
            instance = StrategyUsage.objects.create(strategy=self, date=today, runs=1)

        self.update_stats('usage')

        return instance

    def save_strategy(self, user):
        is_saved = StrategySaved.objects.filter(user=user, strategy=self)
        is_saved = is_saved.count() > 0

        if not is_saved:
            StrategySaved.objects.create(user=user, strategy=self)

        self.update_stats('saved')

    def unsave_strategy(self, user):
        StrategySaved.objects.filter(user=user, strategy=self).delete()
        self.update_stats('saved')

    # Stats
    def get_stats(self):
        data = {
            'ratings': self.get_rating_stats(),
            'saved': self.get_saved_stats(),
            'usage': self.get_usage()
        }
        return data

    def update_stats(self, related_name):
        if related_name == 'ratings':
            self.update_rating_stats()
        elif related_name == 'saved':
            self.update_saved_stats()
        elif related_name == 'usage':
            self.update_usage_stats()

    # Ratings
    def get_rating_stats(self):
        data = {
            'avg': self.stats.rating_avg,
            'count': self.ratings.count(),
        }
        return data

    def update_rating_stats(self):
        aggr = self.ratings.aggregate(Avg('rating'))
        if aggr['rating__avg'] is not None:
            avg = round(aggr['rating__avg'], 1)
            self.stats.rating_avg = avg
            self.stats.save()

    # Saved
    def get_saved_stats(self):
        data = {
            'count': self.stats.saved_count
        }
        return data

    def update_saved_stats(self):
        # Saved count
        saved_count = self.saved.filter(strategy=self).count()
        self.stats.saved_count = saved_count
        self.stats.save()

    # Usage
    def get_usage(self):
        data = {
            'runs_last_30_days': self.stats.runs_last_30_days,
            'total_runs': self.stats.total_runs,
            'history': self.get_usage_history()
        }
        return data

    def get_usage_history(self, last_x_days=30):
        dateFrom = str(datetime.today().date() - timedelta(days=last_x_days))
        data = []
        for usage in self.usage.filter(date__gte=dateFrom):
            data.append({
                'date': usage.date,
                'runs': usage.runs
            })

        return data

    def update_usage_stats(self):
        # IMPORTANT! Variable [queryset] is reusable to avoid database hits...
        today = datetime.utcnow().date()

        # Total Runs
        self.stats.total_runs = self.stats.total_runs + 1

        # 30 days
        date_from = today - timedelta(days=30)
        queryset = self.usage.filter(date__gte=date_from)
        usage = queryset.aggregate(runs_last_30_days=Sum('runs'))
        self.stats.runs_last_30_days = usage['runs_last_30_days']

        # 14 days
        date_from = today - timedelta(days=14)
        usage = queryset.filter(date__gte=date_from).aggregate(runs_last_14_days=Sum('runs'))
        self.stats.runs_last_14_days = usage['runs_last_14_days']

        self.stats.save()


class StrategySaved(models.Model):
    create_time = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, related_name='saved_strategies', on_delete=models.CASCADE)
    strategy = models.ForeignKey(Strategy, related_name='saved', on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'strategy'])
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'strategy'], name='unique_saved_strategies')
        ]


class StrategyStats(models.Model):
    strategy = models.OneToOneField(Strategy, related_name='stats', on_delete=models.CASCADE)
    rating_avg = models.FloatField(default=0)
    saved_count = models.IntegerField(default=0)

    runs_last_14_days = models.IntegerField(default=0)
    runs_last_30_days = models.IntegerField(default=0)
    total_runs = models.IntegerField(default=0)

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.rating_avg)


class StrategyRating(models.Model):
    last_modified = models.DateTimeField(auto_now=True)
    strategy = models.ForeignKey(Strategy, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=0, validators=[
        validators.MinValueValidator(1),
        validators.MaxValueValidator(5)]
    )
    review = models.CharField(max_length=1024, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'strategy'])
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'strategy'], name='unique_rating')
        ]

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.user.username)


class StrategyUsage(models.Model):
    strategy = models.ForeignKey(Strategy, related_name='usage', db_index=True, on_delete=models.CASCADE)
    date = models.DateField(auto_now=True, db_index=True)
    runs = models.IntegerField(default=1)

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.date)

