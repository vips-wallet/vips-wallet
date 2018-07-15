<template>
  <v-layout row wrap justify-center>
    <qrcode-reader
      @init="onCameraInit"
      @decode="onCameraDecode"
      :paused="paused"
      :video-constraints="camera_config"
    >
      <v-btn
        block
        absolute
        bottom
        v-if="paused"
        color="primary"
        @click.stop="rescan()"
        v-t="'common.rescan'"
      ></v-btn>
      <v-btn
        block
        absolute
        bottom
        v-else
        color="primary"
        @click.stop="openFile"
        v-t="'common.load_file'"
      ></v-btn>
    </qrcode-reader>
  </v-layout>
</template>

<style scoped>
</style>

<script>
import utils from '@/utils/utils'
import CONST from '@/utils/const'

export default {
  name: 'QRScanner',
  data () {
    return {
      paused: false,
      camera_config: CONST.QRCODE_CAMERA_CONFIG
    }
  },
  methods: {
    onCameraInit (promise) {
      promise.then(() => {
        this.paused = false
      }).catch(error => {
        this.paused = true
        this.$emit('initError', error)
      })
    },
    onCameraDecode (content) {
      this.paused = true
      this.$globalEvent.$emit('camera-finished')
      this.$emit('finish', content)
    },
    openFile () {
      this.paused = true
      utils.openQRCodeImage().then(code => {
        this.$emit('finish', code.data)
      }).catch(error => {
        console.error(error)
        this.$store.commit('setURI', null)
        this.$emit('loadFileError', error)
      }).finally(() => {
        this.$globalEvent.$emit('camera-finished')
      })
    },
    rescan () {
      this.paused = false
    }
  }
}
</script>
