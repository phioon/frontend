from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from search_engine import serializers, paginators, utils as utils_search
from app import models_auth, models as models_app


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_models_top(request):
    if 'q' not in request.query_params:
        raise ValidationError({'query': 'is missing.'})

    if 'top' in request.query_params:
        top = int(request.query_params['top'])
    else:
        top = 5

    q = request.query_params['q']
    q = utils_search.format_query(q)

    user_results = models_auth.UserCustom.objects.search(query=q, top=top)
    strategy_results = models_app.Strategy.objects.search(query=q, top=top)

    result = {
        'users': serializers.UserSerializer(user_results, many=True).data,
        'strategies': serializers.StrategySerializer(strategy_results, many=True).data
    }
    return Response(result)


class SearchUserList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.UserSerializer
    pagination_class = paginators.StandardCursorPagination

    def get_queryset(self):
        if 'q' not in self.request.query_params:
            raise ValidationError({'query': 'is missing.'})

        q = self.request.query_params['q']
        q = utils_search.format_query(q)

        qs = models_auth.UserCustom.objects.search(query=q)
        return qs


class SearchStrategyList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.StrategySerializer
    pagination_class = paginators.StandardCursorPagination

    def get_queryset(self):
        if 'q' not in self.request.query_params:
            raise ValidationError({'query': 'is missing.'})

        q = self.request.query_params['q']
        q = utils_search.format_query(q)

        qs = models_app.Strategy.objects.search(query=q)
        return qs
