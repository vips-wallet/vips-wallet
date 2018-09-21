import CONST from '@/utils/const'
import storage from '@/storage'
import store from '@/store'
import axios from 'axios'
import qrcode from 'qrcode'
import bip21 from 'bip21'
import jsQR from 'jsqr'

let openURICallback = null

async function walletExists () {
  return storage.getItem('wallets').then(w => {
    if (w !== null) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('wallets does not exists'))
    }
  })
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

function getAddressQRCode (addr, opt) {
  let uri = bip21.encode(addr, opt, CONST.BIP21URN)
  return getQRCode(uri)
}

function getQRCode (data) {
  return new Promise((resolve, reject) => {
    qrcode.toDataURL(
      data,
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

function wait (msec = 200) {
  return new Promise(resolve => {
    setTimeout(resolve, msec)
  })
}

function openQRCodeImage () {
  const img = new Image()
  const canvas = document.createElement('canvas')
  return openImageFile().then(data => {
    return new Promise((resolve, reject) => {
      img.addEventListener('load', () => {
        resolve()
      })
      img.src = data
    })
  }).then(() => {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return jsQR(imageData.data, canvas.width, canvas.height)
  })
}

function openImageFile () {
  let fn = openFileForBrowser
  if (window.cordova) {
    fn = openImageFileForMobile
  }
  return fn()
}

function openImageFileForMobile () {
  return new Promise((resolve, reject) => {
    let opt = {
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: navigator.camera.MediaType.PICTURE
    }
    navigator.camera.getPicture(resolve, reject, opt)
  }).then(uri => {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(
        uri,
        (fileEntry) => {
          fileEntry.file(resolve)
        },
        reject
      )
    })
  }).then(file => {
    let reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  })
}

function openFileForBrowser () {
  let file = document.createElement('input')
  file.type = 'file'
  document.body.appendChild(file)
  return new Promise((resolve, reject) => {
    file.onchange = (ev) => {
      document.body.removeChild(file)
      let files = ev.target.files || ev.dataTransfer.files
      if (files.length) {
        resolve(files[0])
      } else {
        reject(new Error('missing file'))
      }
    }
    file.click()
  }).then(file => {
    let reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  })
}

function base64ToBlob (base64) {
  let bin = atob(base64.replace(/^.*,/, ''))
  let buf = new Uint8Array(bin.length)
  for (var i = 0; i < bin.length; i++) {
    buf[i] = bin.charCodeAt(i)
  }

  let blob
  try {
    blob = new Blob([buf.buffer], {type: 'image/png'})
  } catch (e) {
    return false
  }
  return blob
}

function isiOS () {
  let ua = window.navigator.userAgent.toLowerCase()
  return (ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1 || ua.indexOf('ipad') !== -1)
}

function isMobileSafari () {
  let ua = window.navigator.userAgent.toLowerCase()
  return (isiOS() && ua.indexOf('safari') !== -1)
}

function isCameraSupport () {
  return (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined)
}

export default {
  walletExists: walletExists,
  walletLoaded: walletLoaded,
  getTicker: getTicker,
  decodeURI: decodeURI,
  encodeURI: encodeURI,
  handleOpenURI: handleOpenURI,
  handleOpenURICallback: handleOpenURICallback,
  getAddressQRCode: getAddressQRCode,
  getQRCode: getQRCode,
  copyClipBoard: copyClipBoard,
  checkTouchID: checkTouchID,
  verifyTouchID: verifyTouchID,
  wait: wait,
  openQRCodeImage: openQRCodeImage,
  openImageFile: openImageFile,
  openImageFileForMobile: openImageFileForMobile,
  openFileForBrowser: openFileForBrowser,
  base64ToBlob: base64ToBlob,
  isiOS: isiOS,
  isMobileSafari: isMobileSafari,
  isCameraSupport: isCameraSupport
}
