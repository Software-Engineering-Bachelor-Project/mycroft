from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.
@api_view(['POST'])
def new_counter(request):
    if request.method == 'POST':
        return Response({"counter": "test"})
