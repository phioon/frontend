from app.models import Currency, Country, Subscription, PositionType


def app_initiator():
    # Tratar logs nesse bloco! Trazer informacao de excecoes via dicionario
    currency = Currency()
    country = Country()
    subscripton = Subscription()
    pType = PositionType()

    currency.init()
    country.init()
    subscripton.init()
    pType.init()
