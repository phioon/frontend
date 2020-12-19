from django.contrib.auth.models import User
from django.db.models import Avg, Sum
from django.core import validators
from django.db import models
from datetime import datetime, timedelta


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

    owner = models.ForeignKey(User, editable=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    desc = models.CharField(max_length=2048, blank=True)
    type = models.CharField(max_length=8, verbose_name='buy or sell')

    is_public = models.BooleanField(default=True, verbose_name='Visibility')
    is_dynamic = models.BooleanField(default=False, verbose_name='Logic type')
    rules = models.TextField()

    def __str__(self):
        return str(self.pk)

    def rate(self, user, value):
        try:
            # Try to update instance...
            instance = StrategyRating.objects.get(strategy=self, user=user)
            instance.rating_avg = value
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

    def set_save(self, user, value):
        try:
            # Try to update instance...
            instance = StrategyRating.objects.get(strategy=self, user=user)
            instance.is_saved = value
            instance.save()
        except StrategyRating.DoesNotExist:
            instance = StrategyRating.objects.create(strategy=self, user=user, is_saved=value)

        self.update_stats('ratings')

        return instance

    def update_stats(self, related_name):
        if related_name == 'usage':
            self.update_usage()
        elif related_name == 'ratings':
            self.update_ratings()

    def update_ratings(self):
        # Ratings
        aggr = self.ratings.aggregate(Avg('rating'))
        if aggr['rating__avg'] is not None:
            avg = round(aggr['rating__avg'], 2)
            self.stats.rating_avg = avg

        # Is Saved
        saved_count = self.ratings.filter(is_saved=True).count()
        self.stats.saved_count = saved_count
        self.stats.save()

    def update_usage(self):
        # IMPORTANT! Variable [queryset] is reusable to avoid database hits...
        today = datetime.utcnow().date()

        # 14 days
        date_from = today - timedelta(days=14)
        queryset = self.usage.filter(date__gte=date_from)
        usage = queryset.aggregate(runs_last_14_days=Sum('runs'))
        self.stats.runs_last_14_days = usage['runs_last_14_days']

        # 7 days
        date_from = today - timedelta(days=7)
        usage = queryset.filter(date__gte=date_from).aggregate(runs_last_7_days=Sum('runs'))
        self.stats.runs_last_7_days = usage['runs_last_7_days']

        self.stats.save()


class StrategyStats(models.Model):
    strategy = models.OneToOneField(Strategy, related_name='stats', on_delete=models.CASCADE)
    rating_avg = models.FloatField(default=0)
    saved_count = models.IntegerField(default=0)

    runs_last_7_days = models.IntegerField(default=0)
    runs_last_14_days = models.IntegerField(default=0)

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.rating_avg)


class StrategyRating(models.Model):
    last_modified = models.DateTimeField(auto_now=True)
    strategy = models.ForeignKey(Strategy, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_saved = models.BooleanField(default=False)
    rating = models.IntegerField(default=0, validators=[
        validators.MinValueValidator(1),
        validators.MaxValueValidator(5)]
    )

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

