import {BigNumber} from 'bignumber.js'
import { WalletGroup } from 'vipstarcoinjs-wallet-core'
import moment from 'moment'
import Vue from 'vue'
import Vuex from 'vuex'
import utils from '@/utils/utils'
import CONST from '@/utils/const'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    network: CONST.NETWORK,
    walletGroup: null,
    account: null,
    password_required: false,
    qrcodeDataUri: null,
    price: 0,
    fiatCurrency: localStorage.getItem('currency') || 'JPY',
    walletInfo: {
      balance: 0,
      uncormedBalance: 0,
      fiatBalance: 0
    },
    updateTime: moment(),
    uri: null,
    agreement: (localStorage.getItem('agreement') === '1'),
    useCamera: false
  },
  mutations: {
    setWallet (state, walletGroup) {
      state.walletGroup = walletGroup
    },
    setCurrentAccount (state, account) {
      state.account = account
    },
    setCurrentAccountByLabel (state, label) {
      let account = state.walletGroup.getAccountByLabel(label)
      if (label !== undefined) {
        state.account = account
      } else {
        // TODO: does'nt find Account Error
      }
    },
    setPasswordRequired (state, flg) {
      state.password_required = flg
    },
    setQRCode (state, dataUri) {
      state.qrcodeDataUri = dataUri
    },
    setWalletInfo (state, info) {
      Object.keys(info).forEach((key) => {
        state.walletInfo[key] = info[key]
      })
    },
    setFiatCurrency (state, code) {
      state.fiatCurrency = code
    },
    setFiatPrice (state, price) {
      state.price = price
    },
    setFiatBalance (state, balance) {
      state.walletInfo.fiatBalance = balance
    },
    setInfoUpdateTime (state) {
      state.updateTime = moment()
    },
    setURI (state, uri) {
      if (uri) {
        try {
          state.uri = utils.decodeURI(uri)
        } catch (error) {
          console.error(error)
          state.uri = null
        }
      } else {
        state.uri = null
      }
    },
    agreement (state) {
      state.agreement = true
      localStorage.setItem('agreement', '1')
    },
    setUseCamera (state, flg) {
      state.useCamera = flg
    },
    toggleUseCamera (state) {
      state.useCamera = !state.useCamera
    }
  },
  actions: {
    async openWalletGroup ({commit, state}, json) {
      return new Promise((resolve, reject) => {
        let config = JSON.parse(json)
        commit('setWallet', new WalletGroup(config, state.network))
        commit('setCurrentAccount', state.walletGroup.getAccountByLabel())
        resolve()
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async importMnemonic ({commit, state}, {mnemonic, password}) {
      return new Promise((resolve, reject) => {
        commit('setWallet', WalletGroup.fromMnemonic(mnemonic, password, state.network))
        commit('setCurrentAccount', state.walletGroup.createAccount('Default', 44, 0, password))
        state.walletGroup.defaultAccount = 'Default'
        resolve()
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async importEntropy ({commit, state}, {entropy, seed, password}) {
      return new Promise((resolve, reject) => {
        commit('setWallet', WalletGroup.generate(entropy, seed, state.network))
        commit('setCurrentAccount', state.walletGroup.createAccount('Default', 44, 0, password))
        state.walletGroup.defaultAccount = 'Default'
        resolve()
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async initialize ({dispatch, commit, state}, json) {
      let promise = Promise.resolve()
      if (state.walletGroup === null) {
        promise = dispatch('openWalletGroup', json)
      }
      return promise.then(() => {
        return dispatch('updateInfo')
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async updateInfo ({dispatch, commit, state}) {
      return Promise.all([
        dispatch('updateBalance'),
        dispatch('updateFiat')
      ]).then(() => {
        console.log(`${state.fiatCurrency} rate: ${state.price.toString()}`)
        commit('setFiatBalance', state.walletInfo.balance.multipliedBy(state.price))
        commit('setInfoUpdateTime')
        return Promise.resolve()
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async updateBalance ({commit, state}) {
      return state.account.getBalanceDetail().then(info => {
        commit('setWalletInfo', info)
        return info
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    async updateFiat ({commit, state}) {
      return utils.getTicker(state.fiatCurrency).then(resp => {
        return new Promise((resolve, reject) => {
          let quote = resp.data.quotes[state.fiatCurrency]
          if (quote === null) {
            reject(new Error(`${state.fiatCurrency} does not supported`))
          } else {
            let price = new BigNumber(quote.price)
            commit('setFiatPrice', price)
            resolve(price)
          }
        })
      }).catch(error => {
        return Promise.reject(error)
      })
    },
    deleteWallet ({commit, state}) {
      localStorage.removeItem('wallets')
      commit('setWallet', null)
      commit('setCurrentAccount', null)
      commit('setQRCode', null)
      commit('setURI', null)
      commit('setWalletInfo', {
        balance: 0,
        uncormedBalance: 0,
        fiatBalance: 0
      })
    }
  }
})
export default store
