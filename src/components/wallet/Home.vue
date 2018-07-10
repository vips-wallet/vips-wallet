<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <qrcode-reader
        v-if="show_camera"
        @init="onCameraInit"
        @decode="onCameraDecode"
        :paused="paused"
      ></qrcode-reader>
      <v-layout row wrap justify-center v-if="!loaded">
        <div class="mt-5">
          <v-progress-circular indeterminate :size="50" color="amber"></v-progress-circular>
        </div>
      </v-layout>
      <v-card v-if="loaded && !show_camera">
        <v-card-title primary-title>
          <div class="balance-info">
            <div class="headline" v-t="'home.confirmed_balance'"></div>
            <span class="red--text balance">{{ $store.state.walletInfo.balance.toString() }} VIPS</span>
            <span
              class="gray--text"
              v-if="$store.state.walletInfo.unconfirmedBalance > 0"
              v-t="{path: 'home.unconfirmed', args: {unconfirmed: $store.state.walletInfo.unconfirmedBalance.toString()}}"
            ></span>
            <div class="headline" v-t="'home.fiat'"></div>
            <span
              class="red--text balance"
              v-t="{path: 'home.fiat_balance', args: {amount: $store.state.walletInfo.fiatBalance.toString(), currency: $store.state.fiatCurrency}}"
            ></span><br />
          <span class="gray--text" v-t="{path: 'home.fiat_fetch_time', args: {time: $store.state.updateTime.format('YYYY/MM/DD HH:mm:ss')}}"></span>
          </div>
        </v-card-title>
      </v-card>
    </v-flex>
    <v-dialog v-model="error" persistent max-width="500px">
      <v-card>
        <v-card-text v-t="'home.error.connection_failed'"></v-card-text>
        <v-card-text v-if="error_detail != ''">( {{error_detail}} )</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click.stop="reload()" v-t="'common.reload'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
div.balance-info {
  margin: 0 auto;
  text-align: center;
}
div.balance-info div.headline {
  margin-top: 1.5em;
}
div.balance-info span.balance {
  font-size: 1.5em;
}
div.balance-info span.text{
  font-weight: bold;
}
</style>

<script>
import utils from '@/utils/utils'
import CONST from '@/utils/const'

export default {
  name: 'WalletHome',
  data () {
    return {
      paused: false,
      loaded: false,
      update_error: false,
      camera_error: false,
      error_detail: '',
      show: false,
      show_camera: false,
      cmc_url: CONST.CMC_URL
    }
  },
  mounted () {
    this.$globalEvent.$on('wallet-info-updated', this.walletInfoUpdated)
    this.$globalEvent.$on('do-update-wallet-info', this.doUpdateWalletInfo)
    this.$globalEvent.$on('error-update-wallet-info', this.errorUpdateWalletInfo)
    this.$globalEvent.$on('camera-button-pushed', this.cameraButtonPushed)
    if (utils.walletLoaded()) {
      this.loaded = false
      this.$globalEvent.$emit('do-update-wallet-info')
    }
    if (window.cordova) {
      document.addEventListener('deviceready', this.onDeviceReady, false)
    }
  },
  destroyed () {
    this.$globalEvent.$off('wallet-info-updated', this.walletInfoUpdated)
    this.$globalEvent.$off('do-update-wallet-info', this.doUpdateWalletInfo)
    this.$globalEvent.$off('error-update-wallet-info', this.errorUpdateWalletInfo)
    this.$globalEvent.$off('camera-button-pushed', this.cameraButtonPushed)
    if (window.cordova) {
      document.removeEventListener('deviceready', this.onDeviceReady, false)
      document.removeEventListener('backbutton', this.onBackKeyDown, false)
    }
  },
  computed: {
    error: {
      get () {
        return (this.update_error || this.camera_error)
      },
      set (value) {
        this.camera_error = value
        this.update_error = value
        this.error_detail = ''
      }
    }
  },
  methods: {
    doUpdateWalletInfo () {
      this.loaded = false
    },
    walletInfoUpdated () {
      this.loaded = true

      this.$globalEvent.$emit('toolbar-button-visible', {
        delete: false,
        refresh: true,
        camera: true
      })

      this.$globalEvent.$emit('toolbar-title', this.$t('home.description'))
    },
    errorUpdateWalletInfo (error) {
      this.update_error = true
      this.error_detail = error.message
    },
    reload () {
      this.error = false
      this.error_detail = ''
      this.$globalEvent.$emit('do-update-wallet-info')
    },
    cameraButtonPushed () {
      this.paused = true
      if (this.show_camera) {
        this.$globalEvent.$emit('camera-finished')
      }
      this.show_camera = !this.show_camera
    },
    onCameraInit (promise) {
      promise.then(() => {
        this.paused = false
      }).catch(error => {
        this.paused = true
        this.show_camera = false
        this.camera_error = true
        this.error_detail = error.message
        console.error(error)
      })
    },
    onCameraDecode (content) {
      try {
        this.$store.commit('setURI', content)
      } catch (error) {
        this.$store.commit('setURI', null)
        this.camera_error = true
        this.error_detail = error.message
        console.error(error)
      }
      this.paused = true
      this.show_camera = false
      this.$globalEvent.$emit('camera-finished')
      if (this.$store.state.uri) {
        this.$router.push('/wallet/send')
      }
    },
    onDeviceReady () {
      document.addEventListener('backbutton', this.onBackKeyDown, false)
    },
    onBackKeyDown (ev) {
      if (window.location.hash === '#/wallet/home') {
        ev.preventDefault()
        navigator.app.exitApp()
      }
    }
  }
}
</script>