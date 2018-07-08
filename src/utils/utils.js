import CONST from '@/utils/const'
import store from '@/store'
import axios from 'axios'
import qrcode from 'qrcode'
import bip21 from 'bip21'

let openURICallback = null

function walletExists () {
  return (localStorage.getItem('wallets') !== null)
}

function walletLoaded () {
  return (store.state.walletGroup !== null)
}

function getTicker (code) {
  let uri = `${CONST.TICKER.URL}${CONST.TICKER.ID}/`
  if (code !== null || code !== '') {
    uri = `${uri}?convert=${code}`
  }
  return new Promise((resolve, reject) => {
    axios.get(uri).then((resp) => {
      resolve(resp.data)
    }).catch((error) => {
      reject(error)
    })
  })
}

function decodeURI (uri) {
  return bip21.decode(uri, CONST.BIP21URN)
}

function encodeURI (addr, opt) {
  return bip21.encode(addr, opt, CONST.BIP21URN)
}

function handleOpenURI (uri) {
  if (openURICallback) {
    openURICallback(uri)
  }
}

function handleOpenURICallback (callback) {
  openURICallback = callback
}

function getQRCodeDataUri (addr, opt) {
  let uri = bip21.encode(addr, opt, CONST.BIP21URN)
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(
      uri,
      {
        errorCorrectionLevel: 'M',
        type: 'image/png'
      },
      (err, uri) => {
        if (err !== null) {
          reject(err)
        } else {
          resolve(uri)
        }
      }
    )
  })
}

function copyClipBoard (text) {
  let elem = document.createElement('div')
  elem.appendChild(document.createElement('pre')).textContent = text

  let s = elem.style
  s.position = 'fixed'
  s.left = '-100%'

  document.body.appendChild(elem)
  document.getSelection().selectAllChildren(elem)
  let result = document.execCommand('copy')
  document.body.removeChild(elem)
  return result
}

function checkTouchID () {
  return new Promise((resolve, reject) => {
    if (window.cordova) {
      window.plugins.touchid.isAvailable(
        (type) => {
          window.plugins.touchid.has(
            'password',
            () => resolve(),
            () => reject(new Error('fingerprint is disabled'))
          )
        },
        () => reject(new Error('fingerprint is not supported'))
      )
    } else {
      reject(new Error('fingerprint is not supported'))
    }
  })
}

function verifyTouchID () {
  return checkTouchID().then(() => {
    return new Promise((resolve, reject) => {
      window.plugins.touchid.verify(
        'password',
        'verify sign',
        (password) => resolve(password),
        () => resolve('')
      )
    }).catch(e => {
      return Promise.reject(e)
    })
  })
}

export default {
  walletExists: walletExists,
  walletLoaded: walletLoaded,
  getTicker: getTicker,
  decodeURI: decodeURI,
  encodeURI: encodeURI,
  handleOpenURI: handleOpenURI,
  handleOpenURICallback: handleOpenURICallback,
  getQRCodeDataUri: getQRCodeDataUri,
  copyClipBoard: copyClipBoard,
  checkTouchID: checkTouchID,
  verifyTouchID: verifyTouchID
}
