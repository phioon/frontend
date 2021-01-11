from rest_framework.response import Response
from rest_framework import pagination


class StandardCursorPagination(pagination.CursorPagination):
    page_size = 14
    max_page_size = 14
    ordering = '-rank'


class StandardPagePagination(pagination.PageNumberPagination):
    page_size = 10
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
