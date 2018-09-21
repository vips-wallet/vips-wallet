function setItem (key, value) {
  return new Promise((resolve, reject) => {
    window.NativeStorage.setItem(key, value, resolve, reject)
  }).catch(() => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

function getItem (key) {
  return new Promise((resolve, reject) => {
    window.NativeStorage.getItem(key, resolve, reject)
  }).catch(() => {
    return new Promise((resolve, reject) => {
      try {
        resolve(localStorage.getItem(key))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function removeItem (key) {
  return new Promise((resolve, reject) => {
    window.NativeStorage.remove(key, resolve, reject)
  }).catch(() => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

function key (index) {
  return new Promise((resolve, reject) => {
    window.NativeStorage.keys((keys) => {
      resolve(keys[index])
    }, reject)
  }).catch(() => {
    return new Promise((resolve, reject) => {
      try {
        resolve(localStorage.key(index))
      } catch (error) {
        reject(error)
      }
    })
  })
}

function clear () {
  return new Promise((resolve, reject) => {
    window.NativeStorage.clear(resolve, reject)
  }).catch(() => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  })
}

export default {
  setItem: setItem,
  getItem: getItem,
  removeItem: removeItem,
  key: key,
  clear: clear
}
