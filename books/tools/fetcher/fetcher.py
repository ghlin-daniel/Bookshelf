import requests


def fetch(query, index):
    books_api = 'https://www.googleapis.com/books/v1/volumes?'
    str_query = 'q=' + query
    start_index = '&startIndex=' + str(index)
    max_results = '&maxResults=40'
    fields = '&fields=items(volumeInfo),totalItems'
    url = books_api + str_query + start_index + max_results + fields

    response = requests.get(url)
    data = response.json()

    return data
