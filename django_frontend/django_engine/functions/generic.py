from app.models import Currency, Country, Subscription, SubscriptionPrice, PositionType


def app_initiator():
    # Before execute this function:
    #   1. Create superuser api

    currency = Currency()
    country = Country()
    subscripton = Subscription()
    subscriptonPrice = SubscriptionPrice()
    pType = PositionType()

    currency.init()
    country.init()
    subscripton.init()
    subscriptonPrice.init()
    pType.init()
