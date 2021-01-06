from rest_framework import pagination
from rest_framework.response import Response


class FollowingCursorPagination(pagination.CursorPagination):
    page_size = 14
    max_page_size = 100
    ordering = '-create_time'


class StandardPageNumberPagination(pagination.PageNumberPagination):
    page_size = 20
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
