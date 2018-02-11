from django.urls import path

from . import views

app_name = 'books'
urlpatterns = [
    path('', views.index, name='index'),
    path('search/', views.search, name='search'),
    path('<int:book_isbn13>/', views.detail, name='detail'),
]
