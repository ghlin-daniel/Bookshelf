import requests


def fetch(query, index, key=''):
    books_api = 'https://www.googleapis.com/books/v1/volumes?'
    str_query = 'q=' + query
    start_index = '&startIndex=' + str(index)
    max_results = '&maxResults=40'
    fields = '&fields=items(volumeInfo),totalItems'
    api_key = ('&key=' + key) if key != '' else ''
    url = books_api + str_query + start_index + max_results + fields + api_key

    response = requests.get(url)
    data = response.json()

    return data
