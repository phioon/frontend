from app.locales import enUS, ptBR

locales = {
    'enUS': enUS.locale,
    'ptBR': ptBR.locale
}


def get_translation(locale, comp_id, str_id):
    if locale in locales and comp_id in locales[locale] and str_id in locales[locale][comp_id]:
        return locales[locale][comp_id][str_id]
    else:
        return locales['enUS'][comp_id][str_id]
