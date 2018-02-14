from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib import auth

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


def login(request):
    redirect = request.POST.get('redirect', '/')
    if redirect == '':
        redirect = '/'

    if request.user.is_authenticated:
        return HttpResponseRedirect(redirect)

    username = request.POST.get('username', '')
    password = request.POST.get('password', '')

    user = auth.authenticate(username=username, password=password)

    if user is not None and user.is_active:
        auth.login(request, user)

    return HttpResponseRedirect(redirect)


def logout(request):
    auth.logout(request)
    redirect = request.GET.get('redirect', '/')
    if redirect == '':
        redirect = '/'
    return HttpResponseRedirect(redirect)
