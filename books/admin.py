from django.contrib import admin
from .models import Book, Reader, Bookshelf, Reading

admin.site.register(Book)
admin.site.register(Reader)
admin.site.register(Bookshelf)
admin.site.register(Reading)
