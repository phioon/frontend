from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from api_engine.permissions import IsPremium, IsPlatinum
from requests.auth import HTTPBasicAuth
from django_engine import settings

import requests
import json
import os

if os.getenv('GAE_APPLICATION', None):
    __backendHost__ = 'https://backend.phioon.com'
else:
    if settings.REDIRECT_MARKET_API_TO_PRD:
        __backendHost__ = 'https://backend.phioon.com'
    else:
        __backendHost__ = 'http://127.0.0.1:8000'
__backendApiUser__ = 'frontend_api'
__backendApiPass__ = '#P1q2w3e4r$Api'


@api_view(['GET'])
@permission_classes([IsPremium | IsPlatinum, ])
def TechnicalConditionList(request):
    backendRequest = __backendHost__ + '/api/market/technicalConditions/'

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def StockExchangeList(request):
    backendRequest = __backendHost__ + '/api/market/stockExchanges/'

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def AssetList(request):
    backendRequest = __backendHost__ + '/api/market/assets/'

    detailed = request.query_params.get('detailed')
    stockExchange = request.query_params.get('stockExchange')
    assets = request.query_params.get('assets')
    params = {'detailed': detailed,
              'stockExchange': stockExchange,
              'assets': assets}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def IndicatorList(request):
    backendRequest = __backendHost__ + '/api/market/indicators/'

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__))
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


# Based on Daily chart
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def D_RawList(request):
    backendRequest = __backendHost__ + '/api/market/d/raw/'

    detailed = request.query_params.get('detailed')
    asset = request.query_params.get('asset')
    dateFrom = request.query_params.get('dateFrom')
    dateTo = request.query_params.get('dateTo')
    params = {'detailed': detailed,
              'asset': asset,
              'dateFrom': dateFrom,
              'dateTo': dateTo}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def D_RawLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/raw/latest/'

    stockExchange = request.query_params.get('stockExchange')
    assets = request.query_params.get('assets')
    params = {'stockExchange': stockExchange,
              'assets': assets}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def D_PhiboLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/phibo/latest/'

    stockExchange = request.query_params.get('stockExchange')
    assets = request.query_params.get('assets')
    params = {'stockExchange': stockExchange,
              'assets': assets}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def D_EmaLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/ema/latest/'

    stockExchange = request.query_params.get('stockExchange')
    assets = request.query_params.get('assets')
    params = {'stockExchange': stockExchange,
              'assets': assets}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([IsPremium | IsPlatinum, ])
def D_setupList(request):
    backendRequest = __backendHost__ + '/api/market/d/setups/'

    stockExchange = request.query_params.get('stockExchange')
    dateFrom = request.query_params.get('dateFrom')
    params = {'stockExchange': stockExchange, 'dateFrom': dateFrom}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(json.loads(r.text))


@api_view(['GET'])
@permission_classes([IsPremium | IsPlatinum, ])
def D_setupSummaryList(request):
    backendRequest = __backendHost__ + '/api/market/d/setupSummary/'

    stockExchange = request.query_params.get('stockExchange')
    params = {'stockExchange': stockExchange}

    try:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.Timeout:
        r = requests.get(backendRequest,
                         auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                         params=params)
    except requests.exceptions.RequestException as ex:
        obj_res = {'message': str(ex)}
        return Response(obj_res, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    return Response(json.loads(r.text))
