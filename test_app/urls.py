from django.urls import path
from . import views

urlpatterns = [
    path('test/counter/', views.new_counter),
]
