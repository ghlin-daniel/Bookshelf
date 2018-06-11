"""bookshelf URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

from books import views

from .settings import DEBUG

urlpatterns = [
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('books/', include('books.urls')),
    path('bookshelf/<int:book_isbn13>/update/', views.update_reading, name='update_reading'),
    path('bookshelf/<int:book_isbn13>/delete/', views.delete_reading, name='delete_reading'),
    path('bookshelf/<int:book_isbn13>/read/', views.start_reading, name='start_reading'),
    path('bookshelf/<int:book_isbn13>/abandon/', views.abandon_reading, name='abandon_reading'),
    path('bookshelf/<int:book_isbn13>/finish/', views.finish_reading, name='finish_reading'),
    path('bookshelf/<int:book_isbn13>/', views.reading, name='reading'),
    path('bookshelf/readings/', views.all_readings, name='all_readings'),
    path('bookshelf/', views.my_books, name='bookshelf'),
    path('', views.index),
]

if DEBUG:
    urlpatterns.append(path('register/', views.register, name='register'))
    urlpatterns.append(path('admin/', admin.site.urls))
