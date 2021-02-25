from django.contrib.auth.models import User
from django.db.models import F, Q, Avg, Sum
from django.core import validators
from django.db import models
from search_engine import utils as utils_search
from datetime import datetime, timedelta
import uuid

from app.init import strategies as init_strategies


class Currency(models.Model):
    code = models.CharField(max_length=8, verbose_name='ISO 4217 Code', primary_key=True)
    symbol = models.CharField(max_length=8, verbose_name='examples: US$, R$, A$, C$')
    name = models.CharField(max_length=128)
    thousands_separator_symbol = models.CharField(max_length=1)
    decimal_symbol = models.CharField(max_length=1)

    def __str__(self):
        return self.code

    @staticmethod
    def init():
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

    @staticmethod
    def init():
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

    @staticmethod
    def init():
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

    @staticmethod
    def init():
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

    @staticmethod
    def init():
        PositionType.objects.update_or_create(
            name='buy',
            defaults={'desc': 'Buy'})
        PositionType.objects.update_or_create(
            name='sell',
            defaults={'desc': 'Sell'})


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

    def __str__(self):
        return str(self.user.username + '__' + self.following_user.username)


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


class StrategyManager(models.Manager):
    def search(self, query=None, top=None):
        qs = self.get_queryset()
        if query is not None:
            keywords = utils_search.get_keyword_list(query=query)

            or_lookup = (Q(name__icontains=keywords[0]) |
                         Q(desc__icontains=keywords[0]) |
                         Q(owner__username__icontains=keywords[0]) |
                         Q(owner__first_name__icontains=keywords[0]) |
                         Q(owner__last_name__icontains=keywords[0]))
            qs = qs.filter(or_lookup)

            for keyword in keywords[1:]:
                or_lookup = (Q(name__icontains=keyword) |
                             Q(desc__icontains=keyword) |
                             Q(owner__username__icontains=keyword) |
                             Q(owner__first_name__icontains=keyword) |
                             Q(owner__last_name__icontains=keyword))
                qs = qs | qs.filter(or_lookup)

            qs = qs.filter(is_public=True)
            qs = qs.distinct()
            qs = qs.annotate(rank_saved=F('statistics__saved_count') * 17)
            qs = qs.annotate(rank_runs=F('statistics__runs_last_30_days'))
            qs = qs.annotate(rank=F('rank_saved') + F('rank_runs'))
            qs = qs.order_by('-rank')[:top]
        return qs

    def search_tags(self, query=None):
        qs = self.get_queryset()
        if query is not None:
            qs = qs.filter(tags__icontains=query)

        return qs


class Strategy(models.Model):
    objects = StrategyManager()

    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    create_time = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    owner = models.ForeignKey(User, related_name='strategies', editable=False, on_delete=models.CASCADE)
    name = models.CharField(max_length=64, db_index=True)
    desc = models.CharField(max_length=2048, blank=True)
    type = models.CharField(max_length=8, verbose_name='buy or sell', db_index=True)

    is_public = models.BooleanField(default=True, verbose_name='Visibility')
    is_dynamic = models.BooleanField(default=False, verbose_name='Logic type')

    rules = models.JSONField()
    tags = models.JSONField(default=list)

    def __str__(self):
        return str(self.pk)

    @staticmethod
    def init():
        # 1. Larry Williams
        owner = User.objects.get(username='larry.williams')
        strategies = [
            init_strategies.larry_williams_9_1_long,
            init_strategies.larry_williams_9_1_short,
            init_strategies.larry_williams_9_2_9_3_long,
            init_strategies.larry_williams_9_2_9_3_short,
            init_strategies.larry_williams_9_4_long,
            init_strategies.larry_williams_9_4_short,
        ]
        for strategy in strategies:
            instance = Strategy.objects.update_or_create(owner=owner, name=strategy['name'], defaults={**strategy})[0]
            StrategyStats.objects.get_or_create(strategy=instance)

        # 2. Phioon
        # 2.1 MA Crossings
        owner = User.objects.get(username='phioon')
        strategies = [
            init_strategies.golden_cross,
            init_strategies.death_cross,
            init_strategies.crossing_mme8_mme17_long,
            init_strategies.crossing_mme8_mme17_short,
            init_strategies.crossing_mme9_mma21_long,
            init_strategies.crossing_mme9_mma21_short,
            init_strategies.crossing_mme17_mme72_long,
            init_strategies.crossing_mme17_mme72_short,
        ]
        for strategy in strategies:
            instance = Strategy.objects.update_or_create(owner=owner, name=strategy['name'], defaults={**strategy})[0]
            StrategyStats.objects.get_or_create(strategy=instance)

        # 2.2 Others
        strategies = [
            init_strategies.pc_long,
            init_strategies.pc_short
        ]
        for strategy in strategies:
            instance = Strategy.objects.update_or_create(owner=owner, name=strategy['name'], defaults={**strategy})[0]
            StrategyStats.objects.get_or_create(strategy=instance)

    @property
    def search_rank(self):
        rank = self.statistics.runs_last_30_days * self.saved.count()
        return rank

    @property
    def stats(self):
        data = {
            'ratings': self.get_rating_stats(),
            'saved': self.get_saved_stats(),
            'usage': self.get_usage()
        }
        return data

    @staticmethod
    def convert_order_by(order_by):
        if 'usage' in order_by:
            order_by = order_by.replace('usage', 'statistics__runs_last_14_days')
        elif 'rating' in order_by:
            order_by = order_by.replace('rating', 'statistics__rating_avg')
        elif 'saved' in order_by:
            order_by = order_by.replace('saved', 'statistics__saved_count')

        return order_by

    # Actions
    def rate(self, user, obj):
        try:
            # Try to update instance...
            instance = StrategyRating.objects.get(strategy=self, user=user)
            instance.rating = obj['rating']

            if 'review' in obj:
                instance.review = obj['review']
            instance.save()
        except StrategyRating.DoesNotExist:
            instance = StrategyRating.objects.create(strategy=self,
                                                     user=user,
                                                     **obj)

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
            'avg': self.statistics.rating_avg,
            'count': self.ratings.count(),
        }
        return data

    def update_rating_stats(self):
        aggr = self.ratings.aggregate(Avg('rating'))
        if aggr['rating__avg'] is not None:
            avg = round(aggr['rating__avg'], 1)
            self.statistics.rating_avg = avg
            self.statistics.save()

    # Saved
    def get_saved_stats(self):
        data = {
            'count': self.statistics.saved_count
        }
        return data

    def update_saved_stats(self):
        # Saved count
        saved_count = self.saved.filter(strategy=self).count()
        self.statistics.saved_count = saved_count
        self.statistics.save()

    # Usage
    def get_usage(self):
        data = {
            'runs_last_30_days': self.statistics.runs_last_30_days,
            'total_runs': self.statistics.total_runs,
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
        self.statistics.total_runs = self.statistics.total_runs + 1

        # 30 days
        date_from = today - timedelta(days=30)
        queryset = self.usage.filter(date__gte=date_from)
        usage = queryset.aggregate(runs_last_30_days=Sum('runs'))
        self.statistics.runs_last_30_days = usage['runs_last_30_days']

        # 14 days
        date_from = today - timedelta(days=14)
        usage = queryset.filter(date__gte=date_from).aggregate(runs_last_14_days=Sum('runs'))
        self.statistics.runs_last_14_days = usage['runs_last_14_days']

        self.statistics.save()


class StrategyStats(models.Model):
    strategy = models.OneToOneField(Strategy, related_name='statistics', on_delete=models.CASCADE)
    rating_avg = models.FloatField(default=0)
    saved_count = models.IntegerField(default=0)

    runs_last_14_days = models.IntegerField(default=0)
    runs_last_30_days = models.IntegerField(default=0)
    total_runs = models.IntegerField(default=0)

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.rating_avg)


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


class StrategyRating(models.Model):
    last_modified = models.DateTimeField(auto_now=True)
    strategy = models.ForeignKey(Strategy, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='ratings', on_delete=models.CASCADE)
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
    runs = models.IntegerField(default=0)

    def __str__(self):
        return str(self.strategy.pk) + '__' + str(self.date)


class Collection(models.Model):
    name = models.CharField(max_length=64, db_index=True)
    is_public = models.BooleanField(default=True)

    owner = models.ForeignKey(User, related_name='collections', editable=False, on_delete=models.CASCADE)
    strategies = models.ManyToManyField(Strategy, through='CollectionMembership')

    def __str__(self):
        return self.name

    @staticmethod
    def init():
        # Collection Owner
        col_owner = User.objects.get(username='phioon')

        # 1. MA Crossings
        collection = Collection.objects.update_or_create(owner=col_owner, name='ma_crossings')[0]
        strategies = Strategy.objects.filter(owner=col_owner,
                                             desc__icontains='#crossing #movingAverage').order_by('last_modified')
        for x in range(0, len(strategies)):
            collection.strategies.add(strategies[x], through_defaults={'index': x})

        # 2. Classics
        owner = User.objects.get(username='larry.williams')
        collection = Collection.objects.update_or_create(owner=col_owner, name='classics')[0]
        strategies = Strategy.objects.filter(owner__in=[owner, col_owner],
                                             desc__icontains='#classics').order_by('last_modified')
        for x in range(0, len(strategies)):
            collection.strategies.add(strategies[x], through_defaults={'index': x})


class CollectionMembership(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    strategy = models.ForeignKey(Strategy, on_delete=models.CASCADE)
    index = models.IntegerField()

    create_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['index']
