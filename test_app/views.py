from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.

# This view is used by the TestComponent.
@api_view(['POST'])
def new_counter(request):
    return Response({
        'counter': int(request.data['counter'])
        * int(request.data['num'])
    })
