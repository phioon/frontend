from app.models import Currency, Country, Subscription, PositionType


def app_initiator():
    # Before execute this function:
    #   1. Create superuser api

    currency = Currency()
    country = Country()
    subscripton = Subscription()
    pType = PositionType()

    currency.init()
    country.init()
    subscripton.init()
    pType.init()
