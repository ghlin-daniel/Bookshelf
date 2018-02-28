from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.contrib import auth
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.forms.models import model_to_dict

from django.core import serializers

from .models import Book, Reader, Bookshelf, Reading


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

    if request.user.is_authenticated and book is not None:
        user = request.user
        query_set = Bookshelf.objects.filter(reader__user=user).filter(book=book)
        book.owned = query_set.count() > 0

    return render(request, 'books/detail.html', {'book': book})


def add_book(request, book_isbn13):
    if not request.user.is_authenticated:
        return HttpResponseRedirect('/')

    try:
        book = Book.objects.get(isbn13=book_isbn13)
    except Book.DoesNotExist:
        book = None

    if book is not None:
        reader = Reader.objects.get(user__id=request.user.id)
        if reader is not None:
            try:
                bookshelf = Bookshelf(reader=reader, book=book)
                bookshelf.save()
            except IntegrityError:
                pass

    return HttpResponseRedirect('/bookshelf')


def remove_book(request, book_isbn13):
    if not request.user.is_authenticated:
        return HttpResponseRedirect('/')

    try:
        book = Book.objects.get(isbn13=book_isbn13)
    except Book.DoesNotExist:
        book = None

    if book is not None:
        reader = Reader.objects.get(user__id=request.user.id)
        if reader is not None:
            Bookshelf.objects.filter(reader=reader).filter(book=book).delete()

    return HttpResponseRedirect('/bookshelf')


def reading(request, book_isbn13):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Please login first'})

    try:
        book = Book.objects.get(isbn13=book_isbn13)
        readings = Reading.objects.filter(bookshelf__book=book).order_by('start_date')
        readings = [{"start_date": r.start_date, "end_date": r.end_date} for r in readings]
    except Book.DoesNotExist:
        book = None
        readings = None

    data = {
        'book': model_to_dict(book),
        'readings': readings,
    }

    print(readings)

    return JsonResponse(data)


def my_books(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect('/')

    reader = Reader.objects.get(user__id=request.user.id)
    books = Book.objects.filter(bookshelf__reader=reader)

    return render(request, 'readers/my_books.html', {'books': books})


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


def register(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/')

    username = request.POST.get('username', '')
    email = request.POST.get('email', '')
    password = request.POST.get('password', '')
    error = ''

    if username != '' and email != '' and password != '':
        try:
            user = User.objects.create_user(username, email, password)

            reader = Reader(user=user)
            reader.save()

            auth.login(request, user)

            return HttpResponseRedirect('/')
        except IntegrityError:
            error = 'Please try another username'

    return render(request, 'readers/register.html', {'error': error})
