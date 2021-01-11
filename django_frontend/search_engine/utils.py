default_sep = ' '
known_seps = [' ', ',', '.', ';', ':', '|']

connections_ptBR = [' e ', ' ou ']
connections_enUS = [' and ', ' or ']


def get_keyword_list(query, seps=[' ']):
    keywords = []
    if seps is None:
        seps = known_seps

    keywords = query.split(default_sep)

    return keywords


def format_query(text):
    text = ' '.join(text.split())
    text = text.lower()
    return text
