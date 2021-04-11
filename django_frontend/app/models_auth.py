from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q, Count

from django_engine import settings
from app import models as models_app
from app.locale import get_translation
from search_engine import utils as utils_search


class UserCustomManager(models.Manager):
    def search(self, query=None, top=None):
        qs = self.get_queryset()
        if query is not None:
            qs = qs.filter(user__is_active__exact=True)
            keywords = utils_search.get_keyword_list(query=query)

            or_lookup = (Q(user__first_name__icontains=keywords[0]) |
                         Q(user__last_name__icontains=keywords[0]) |
                         Q(user__username__icontains=keywords[0]))
            qs = qs.filter(or_lookup)

            for keyword in keywords[1:]:
                or_lookup = (Q(user__first_name__icontains=keyword) |
                             Q(user__last_name__icontains=keyword) |
                             Q(user__username__icontains=keyword))
                qs = qs | qs.filter(or_lookup)

            qs = qs.distinct()
            qs = qs.annotate(rank=Count('user__followers'))
            qs = qs.order_by('-rank')[:top]
        return qs


class UserCustom(models.Model):
    # Want fields here to be retrieved by Frontend? Add them into UserSerializer (not UserCustomSerializer)
    # UserCustomSerializer is used only for updating UserCustom objects
    objects = UserCustomManager()

    last_modified = models.DateTimeField(auto_now=True)
    user = models.OneToOneField(User, related_name='userCustom', on_delete=models.CASCADE)
    birthday = models.DateField(null=True)
    nationality = models.ForeignKey(models_app.Country, on_delete=models.DO_NOTHING)
    stripe_customer_id = models.CharField(max_length=32, null=True, unique=True)
    # subscription
    subscription = models.ForeignKey(models_app.Subscription, on_delete=models.DO_NOTHING)
    subscription_status = models.CharField(max_length=16, default='undefined')
    subscription_expires_on = models.DateField(null=True, db_index=True)
    subscription_renews_on = models.DateField(null=True, db_index=True)
    # social
    about_me = models.CharField(max_length=2048, blank=True, default='')
    links = models.JSONField(default=list)

    def __str__(self):
        return self.user.username

    @property
    def search_rank(self):
        return self.user.followers.count()

    @staticmethod
    def create_user_custom(data):
        try:
            user_custom = UserCustom.objects.get_or_create(
                user=data['user'],
                defaults={
                    'nationality': data['nationality'],
                    'subscription': data['subscription']
                })[0]

            user_prefs = UserPreferences.objects.get_or_create(
                user=data['user'],
                defaults={
                    'locale': data['locale'],
                    'currency': data['nationality'].currency
                })[0]

            obj_res = {
                'status': 200,
                'data': user_custom
            }
        except:
            obj_res = {
                'status': 500,
                'data': {'message': 'Something went wrong. UserCustom could not be created.'}
            }

        return obj_res

    @staticmethod
    def create_user(data):
        user = User.objects.filter(username=data['username'])

        if not user.exists():
            user = User.objects.create_user(**data)

        return user

    @staticmethod
    def init():
        # Default data for Reference users
        user_data = {
            'is_active': True,
            'password': settings.DEFAULT_PWD,
            'email': 'helpme@phioon.com'
        }
        custom_data = {
            'subscription': models_app.Subscription.objects.get(pk='basic'),
            'nationality': models_app.Country.objects.get(pk='BR'),
            'locale': 'ptBR'}

        # 1 Nationality: BR
        # 1.1 Phioon Team
        user_data['first_name'] = 'Phioon'
        user_data['last_name'] = 'Team'
        user_data['username'] = 'phioon'
        custom_data['user'] = UserCustom.create_user(user_data)

        if isinstance(custom_data['user'], User):
            UserCustom.create_user_custom(custom_data)

        # 2. Nationality: US
        # 2.1 Larry Williams
        user_data['first_name'] = 'Larry'
        user_data['last_name'] = 'Williams'
        user_data['username'] = 'larry.williams'
        custom_data['user'] = UserCustom.create_user(user_data)
        custom_data['nationality'] = models_app.Country.objects.get(pk='US')
        custom_data['locale'] = 'enUS'

        if isinstance(custom_data['user'], User):
            UserCustom.create_user_custom(custom_data)

    def create_first_wallet(self):
        locale = self.user.userPrefs.locale
        currency = self.user.userPrefs.currency

        wallet = models_app.Wallet.objects.get_or_create(
            owner=self.user,
            name=get_translation(locale=locale, comp_id='wallet', str_id='first_name'),
            defaults={
                'desc': '',
                'currency': currency,
                'se_short': 'BVMF'
            })[0]

        obj_res = {
            'status': 200,
            'data': wallet
        }
        return obj_res


class UserPreferences(models.Model):
    user = models.OneToOneField(User, related_name='userPrefs', on_delete=models.CASCADE)
    locale = models.CharField(max_length=8)
    currency = models.ForeignKey(models_app.Currency, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.user.username

    def get_field_list(self):
        fields = []

        ignore_fields = ['id', 'user']
        for field in self._meta.fields:
            if field.name not in ignore_fields:
                fields.append(field.name)

        return fields