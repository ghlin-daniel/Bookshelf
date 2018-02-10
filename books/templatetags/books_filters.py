from django import template

register = template.Library()


@register.filter
def get_page_range(page, total):
    page_index = get_page_index(page)
    page_from = page_index + 1
    page_to = page_index + 10

    if page_to * 10 > total:
        page_to = (total / 10) + (1 if total % 10 != 0 else 0)

    return range(int(page_from), int(page_to + 1))


@register.filter
def have_previous(page):
    return get_page_index(page) != 0


@register.filter
def have_next(page, total):
    last_page = get_page_index(page) + 10
    return total > (last_page * 10)


@register.filter
def jump_to_previous(page):
    return get_page_index(page) - 10 + 1


@register.filter
def jump_to_next(page):
    return get_page_index(page) + 10 + 1


def get_page_index(page):
    return int((page - 1) / 10) * 10
