from django.contrib import admin
from .models import Book, Reader, Bookshelf, Reading


class BookAdmin(admin.ModelAdmin):
    ordering = ['-id']
    search_fields = ['title', 'authors']


admin.site.register(Book, BookAdmin)
admin.site.register(Reader)
admin.site.register(Bookshelf)
admin.site.register(Reading)
