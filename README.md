# Bookshelf

Steps:
  1. $ cd /path/to/bookshelf
  2. Create a virtual environment and activate it (optional)
  3. $ pip install -r requirement.txt
  4. $ ./manage.py makemigrations
  5. $ ./manage.py migrate
  6. $ ./manage.py createsuperuser
  7. $ ./manage.py runserver

If you need some books:
  1. $ cd /path/to/tools
  2. $ python main.py django /path/to/db
