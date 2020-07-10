from django.contrib.auth.models import User
from app.models import Currency, Country, Subscription, PositionType


def app_initiator():
    user = User.objects.get(username='api')
    if user is None:
        User.objects.create_superuser(
            username='api',
            password='#P1q2w3e4r$Api',
            email='support.cloud@phioon.com'
        )

    currency = Currency()
    country = Country()
    subscripton = Subscription()
    pType = PositionType()

    currency.init()
    country.init()
    subscripton.init()
    pType.init()
