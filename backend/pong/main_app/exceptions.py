from rest_framework.views import exception_handler
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if isinstance(exc, TokenError):
        return Response({'detail': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)

    if response is not None:
        return response

    return Response({'detail': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)