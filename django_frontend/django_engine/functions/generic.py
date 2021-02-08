from app import models as models_app
from app import models_auth


def app_initiator():
    # Before execute this function:
    #   1. Create superuser api

    # Auth
    models_auth.UserCustom.init()

    # User
    models_app.Currency.init()
    models_app.Country.init()
    models_app.Subscription.init()
    models_app.SubscriptionPrice.init()

    # Wallet
    models_app.PositionType.init()

    # Strategy
    models_app.Strategy.init()
    models_app.Collection.init()
