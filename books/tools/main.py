import time
import sqlite3
import argparse
from fetcher import fetcher


def save(conn, books):
    count = 0
    for book in books:
        info = book.get('volumeInfo', None)
        if info is None:
            continue

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
            continue

        title = info.get('title', '').replace('"', '\\"')
        subtitle = info.get('subtitle', '').replace('"', '\\"')

        authors = ', '.join(info.get('authors', ''))

        publisher = info.get('publisher', '')
        published_date = info.get('publishedDate', '')
        description = info.get('description', '').replace('"', '\\"')
        page_count = info.get('pageCount', 0)

        image_links = info.get('imageLinks', None)
        image_url = image_links.get('thumbnail', '') if image_links is not None else ''
        if image_url == '':
            continue

        language = info.get('language', '')

        added_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))

        insert = '''INSERT INTO books_book (
            title, subtitle, authors, publisher, published_date, description, isbn10, isbn13, page_count,
            image_url, language, added_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?)'''
        try:
            conn.execute(insert,
                         (title, subtitle, authors, publisher, published_date, description,
                          isbn10, isbn13, page_count, image_url, language, added_date))
            conn.commit()
            count += 1
        except sqlite3.IntegrityError:
            pass

    return count


def get_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("q", help="Query string")
    parser.add_argument("d", help="Database path")
    args = parser.parse_args()
    return args.q, args.d


def main():
    query, db_path = get_arguments()

    conn = sqlite3.connect(db_path)

    total = 0
    count_fetched = 0
    count_inserted = 0

    while count_fetched <= total:
        data = fetcher.fetch(query, count_fetched)
        books = data.get('items', None)
        if books is None:
            break

        count_inserted += save(conn, books)
        total = data.get('totalItems', 0)
        count_fetched += len(books)
        print(str(count_fetched) + ' / ' + str(total))

    conn.close()
    print(str(count_inserted) + " books inserted!")


if __name__ == "__main__":
    main()
