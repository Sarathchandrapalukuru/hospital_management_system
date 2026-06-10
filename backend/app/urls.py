from django.contrib import admin
from django.urls import path,include
from .  import views


urlpatterns = [
    path('api/helloworld',views.hello_world)
]