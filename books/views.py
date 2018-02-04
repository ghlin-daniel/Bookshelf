from django.shortcuts import render

from .models import Book


def index(request):
    books = Book.objects.order_by('-added_date')[:30]
    return render(request, 'books/index.html', {'books': books})
