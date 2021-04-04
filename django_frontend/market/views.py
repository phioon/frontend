from requests.auth import HTTPBasicAuth
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from app.permissions import IsPremium, IsPlatinum
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
@permission_classes([IsPremium | IsPlatinum | permissions.IsAuthenticated, ])
def TechnicalConditionList(request):
    backendRequest = __backendHost__ + '/api/market/technical_conditions/'

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
    backendRequest = __backendHost__ + '/api/market/stock_exchanges/'

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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def AssetList(request):
    backendRequest = __backendHost__ + '/api/market/assets/'
    params = request.query_params
    data = request.data

    try:
        r = requests.post(backendRequest,
                          auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                          json=data,
                          params=params)
    except requests.exceptions.Timeout:
        r = requests.post(backendRequest,
                          auth=HTTPBasicAuth(__backendApiUser__, __backendApiPass__),
                          json=data,
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def D_RawList(request):
    backendRequest = __backendHost__ + '/api/market/d/raw/'

    params = request.query_params

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
def D_QuoteLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/quote/latest/'

    params = request.query_params

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
def D_SmaLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/sma/latest/'

    params = request.query_params

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

    params = request.query_params

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

    params = request.query_params

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
def D_RocLatestList(request):
    backendRequest = __backendHost__ + '/api/market/d/roc/latest/'

    params = request.query_params

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
@permission_classes([IsPremium | IsPlatinum | permissions.IsAuthenticated, ])
def D_setupList(request):
    backendRequest = __backendHost__ + '/api/market/d/setups/'

    params = request.query_params

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
@permission_classes([IsPremium | IsPlatinum | permissions.IsAuthenticated, ])
def D_setupStatsList(request):
    backendRequest = __backendHost__ + '/api/market/d/setup_stats/'

    params = request.query_params

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
