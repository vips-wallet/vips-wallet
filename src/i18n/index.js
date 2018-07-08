import Vue from 'vue'
import VueI18n from 'vue-i18n'

const data = {
  ja: require('./ja.json'),
  en: require('./en.json'),
  de: require('./de.json')
}

Vue.use(VueI18n)

let locale = localStorage.getItem('locale')
let navLang = (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language || window.navigator.userLanguage || window.navigator.browserLanguage
if (navLang.length > 2) {
  navLang = navLang.substr(0, 2)
}
if (!data[navLang]) {
  navLang = null
}

if (!locale) {
  if (navLang) {
    locale = navLang
  } else {
    locale = 'en'
  }
}

export default new VueI18n({
  locale: locale,
  fallbackLocale: 'en',
  messages: data
})
