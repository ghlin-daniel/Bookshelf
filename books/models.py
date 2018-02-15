from django.contrib.auth.models import User
from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True)
    authors = models.CharField(max_length=200, blank=True)
    publisher = models.CharField(max_length=100, blank=True)
    published_date = models.DateField(blank=True, null=True)
    description = models.CharField(max_length=1000, blank=True)
    isbn10 = models.CharField(max_length=10, null=True, default=None, unique=True, blank=True)
    isbn13 = models.CharField(max_length=13, null=True, default=None, unique=True, blank=True)
    page_count = models.IntegerField(blank=True)
    image_url = models.URLField(blank=True)
    language = models.CharField(max_length=10, blank=True)
    added_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title


class Reader(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)

    def __str__(self):
        return self.user.username
