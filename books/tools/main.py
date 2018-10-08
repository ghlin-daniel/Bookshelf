import time
import sqlite3
import argparse
from fetcher import fetcher

import environ
import psycopg2

root = environ.Path(__file__) - 3
base_path = root()
env = environ.Env(DEBUG=(bool, False), )
env_path = base_path + '/.envrc'
environ.Env.read_env(env_path)


def save(db, conn, books):
    count = 0
    for book in books:
        info = book.get('volumeInfo', None)
        if info is None:
            continue

        bk = parse_book(info)
        if bk is None:
            continue

        if db == "psql":
            if insert_psql(conn, bk):
                count += 1
        elif db == "sqlite":
            if insert_sqlite(conn, bk):
                count += 1
        else:
            pass

    return count


def insert_psql(conn, book):
    insert = '''INSERT INTO books_book (
                            title, subtitle, authors, publisher, published_date, description,
                            isbn10, isbn13, page_count, image_url, language, added_date,
                            verified, verified_date, rate_count, categories)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'''
    try:
        cur = conn.cursor()
        cur.execute(insert, (
            book['title'], book['subtitle'], book['authors'], book['publisher'], book['published_date'],
            book['description'], book['isbn10'], book['isbn13'], book['page_count'], book['image_url'],
            book['language'], book['added_date'], False, None, 0, book['categories']))
        conn.commit()
        return True
    except (psycopg2.IntegrityError, psycopg2.DataError):
        conn.rollback()
        return False


def insert_sqlite(conn, book):
    insert = '''INSERT INTO books_book (
                            title, subtitle, authors, publisher, published_date, description,
                            isbn10, isbn13, page_count, image_url, language, added_date,
                            verified, verified_date, rate_count, categories)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'''
    try:
        conn.execute(insert, (
            book['title'], book['subtitle'], book['authors'], book['publisher'], book['published_date'],
            book['description'], book['isbn10'], book['isbn13'], book['page_count'], book['image_url'],
            book['language'], book['added_date'], False, None, 0, book['categories']))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False


def parse_book(info):
    book = {}

    isbn10 = ''
    isbn13 = ''
    isbns = info.get('industryIdentifiers', None)
    if isbns is not None:
        for isbn in isbns:
            if isbn['type'] == 'ISBN_10':
                isbn10 = isbn['identifier']
            elif isbn['type'] == 'ISBN_13':
                isbn13 = isbn['identifier']

    if isbn10 == '' and isbn13 == '':
        return None

    book['isbn10'] = isbn10
    book['isbn13'] = isbn13

    book['title'] = info.get('title', '')
    book['subtitle'] = info.get('subtitle', '')

    book['authors'] = ', '.join(info.get('authors', ''))

    book['publisher'] = info.get('publisher', '')
    book['published_date'] = info.get('publishedDate', '')
    if len(book['published_date']) < 10:
        return None

    book['description'] = info.get('description', '')
    book['page_count'] = info.get('pageCount', 0)

    image_links = info.get('imageLinks', None)
    book['image_url'] = image_links.get('thumbnail', '') if image_links is not None else ''
    if book['image_url'] == '':
        return None

    book['categories'] = ', '.join(info.get('categories', ''))

    book['language'] = info.get('language', '')
    book['added_date'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

    return book


def get_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("query", help="Query string")
    parser.add_argument("-d", "--database", help="Database", default="sqlite")
    args = parser.parse_args()
    return args.query, args.database


def main():
    query, db = get_arguments()

    if db == "psql":
        conn = psycopg2.connect(
            database=env("DATABASE_NAME"),
            user=env("DATABASE_USER"),
            host=env("DATABASE_URL"),
            password=env("DATABASE_PASSWORD"))
    elif db == "sqlite":
        sqlite_path = base_path + "/" + env("SQLITE_NAME")
        conn = sqlite3.connect(sqlite_path)
    else:
        return

    total = 0
    count_fetched = 0
    count_inserted = 0

    while count_fetched <= total:
        data = fetcher.fetch(query, count_fetched, env('GOOGLE_BOOKS_API_KEY'))
        books = data.get('items', None)
        if books is None:
            break

        count_inserted += save(db, conn, books)
        total = data.get('totalItems', 0)
        count_fetched += len(books)
        print(str(count_fetched) + ' / ' + str(total))

    conn.close()
    print(str(count_inserted) + " books inserted!")


if __name__ == "__main__":
    main()
