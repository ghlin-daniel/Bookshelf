from django.shortcuts import render

from .models import Book


def index(request):
    books = Book.objects.order_by('-added_date')[:30]
    return render(request, 'books/index.html', {'books': books})


def search(request):
    page = int(request.GET.get('p', '1'))
    if page < 1:
        page = 1

    query = request.POST.get('q', '')
    if query == '' and 'q' in request.GET:
        query = request.GET.get('q', '')

    books = []
    total = 0

    if query != '':
        query_set = Book.objects.filter(title__icontains=query).order_by('-added_date')
        total = query_set.count()
        books = query_set[(10 * (page - 1)):10 * page]

    return render(request, 'books/search.html', {'q': query, 'books': books, 'total': total, 'page': page})


def detail(request, book_isbn13):
    try:
        book = Book.objects.get(isbn13=book_isbn13)
    except Book.DoesNotExist:
        book = None
    return render(request, 'books/detail.html', {'book': book})
