from django.contrib import admin
from .models import Book, Reader, Bookshelf, Reading, Category


class BookAdmin(admin.ModelAdmin):
    ordering = ['-id']
    search_fields = ['title', 'subtitle', 'authors']
    list_display = ('__str__', 'published_date')


admin.site.register(Book, BookAdmin)
admin.site.register(Reader)
admin.site.register(Bookshelf)
admin.site.register(Reading)
admin.site.register(Category)
