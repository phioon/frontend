from rest_framework.response import Response
from rest_framework import pagination


class FollowingCursorPagination(pagination.CursorPagination):
    page_size = 14
    max_page_size = 14
    ordering = '-create_time'


class ReviewCursorPagination(pagination.CursorPagination):
    page_size = 5
    max_page_size = 5
    ordering = '-last_modified'


class StandardPageNumberPagination(pagination.PageNumberPagination):
    page_size = 8
    max_page_size = 8

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
