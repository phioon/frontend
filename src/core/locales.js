import enUS from "./locales/enUS";
import ptBR from "./locales/ptBR";

const locales = {
  enUS: enUS,
  ptBR: ptBR
}

export function localeList() {
  return Object.keys(locales)
}

export function getTranslation(locale, compId, id) {
  if (locale in locales && compId in locales[locale] && id in locales[locale][compId]) {
    return locales[locale][compId][id];
  }
  else {
    if (id === "") {
      // In some cases (labelAlerts) id can be ""
      return ""
    }
    else
      return locales["enUS"][compId][id];
  }
}