# Bookshelf
Demo
----
[Bookshlef](https://bookshelf-9999.appspot.com/) (Test account: demo / demodemo)

Setup
----
  1. $ cd /path/to/bookshelf
  2. Create a virtual environment and activate it (optional)
  3. $ pip install -r requirements.txt
  4. $ mv .envrc.template .envrc
  5. Replace the variables in .envrc
  6. $ ./manage.py makemigrations
  7. $ ./manage.py migrate
  8. $ ./manage.py createsuperuser
  9. $ ./manage.py runserver

If you need some books:
  1. $ cd /path/to/tools
  2. $ python main.py django /path/to/db
