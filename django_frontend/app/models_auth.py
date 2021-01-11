from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q, Count

from app import models as models_app
from search_engine import utils as utils_search


class UserCustomManager(models.Manager):
    def search(self, query=None, top=None):
        qs = self.get_queryset()
        if query is not None:
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

    @property
    def search_rank(self):
        return self.user.followers.count()

    def __str__(self):
        return self.user.username


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