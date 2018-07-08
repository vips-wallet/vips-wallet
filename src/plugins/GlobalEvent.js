const globalEvent = {
  install: function (Vue, options) {
    Vue.prototype.$globalEvent = new Vue()
  }
}
export default globalEvent
