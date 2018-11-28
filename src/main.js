// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import VueHead from 'vue-head'
import VueQrcodeReader from 'vue-qrcode-reader'

import App from './App'
import router from '@/router'
import i18n from '@/i18n'
import storage from '@/storage'
import store from '@/store'
import utils from '@/utils/utils'
import GlobalEvent from '@/plugins/GlobalEvent.js'

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.use(VueHead)
Vue.use(VueQrcodeReader)
Vue.use(GlobalEvent)

// add cordova.js only if serving the app through file://
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  var cordovaScript = document.createElement('script')
  cordovaScript.setAttribute('type', 'text/javascript')
  cordovaScript.setAttribute('src', 'cordova.js')
  document.body.appendChild(cordovaScript)

  window.handleOpenURL = function (url) {
    utils.handleOpenURI(url)
  }
}

const migrate = () => {
  return storage.getItem('configVersion').then((version) => {
    if (version === null && window.cordova) {
      let converted = []
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i)
        converted.push(storage.setItem(key, localStorage.getItem(key)))
      }
      return Promise.all(converted).then(() => {
        return storage.setItem('configVersion', '1.0.0')
      }).catch(() => {
        console.error('migrate config error')
        return Promise.resolve()
      })
    } else {
      return Promise.resolve()
    }
  }).catch(() => {
    console.error('get configVersion error')
    return Promise.resolve()
  })
}

/* eslint-disable no-new */
const init = () => {
  migrate().then(() => {
    return Promise.all([
      storage.getItem('currency'),
      storage.getItem('agreement'),
      storage.getItem('numberFormat'),
      storage.getItem('locale')
    ])
  }).then(config => {
    store.commit('setFiatCurrency', config[0] || 'JPY')
    if (config[1] === '1') {
      store.commit('agreement')
    }
    store.commit('setNumberFormat', config[2] || 'PLAIN')
    if (config[3]) {
      i18n.locale = config[3]
    }
    return Promise.resolve()
  }).then(() => {
    new Vue({
      el: '#app',
      router,
      i18n,
      store,
      template: '<App/>',
      components: { App },
      head: {
        meta: [
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          }
        ]
      }
    })
  })
}
if (window.location.protocol === 'file:' || window.location.port === '3000') {
  document.addEventListener(
    'deviceready',
    init,
    false
  )
} else {
  init()
}
