<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600">
      <v-card>
        <v-card-title class="headline" v-t="'message.warning.title'"></v-card-title>
        <ul>
          <li v-if="isiOS" v-html="$t('message.warning.ios')"></li>
          <li v-if="isCameraNotSupported" v-html="$t('message.warning.camera_not_supported')"></li>
        </ul>
        <v-card-actions>
          <v-btn color="primary" block @click.native="close()" v-t="'common.close'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<style scoped>
</style>

<script>
import utils from '@/utils/utils'

export default {
  data () {
    return {
      dialog: false,
      isiOS: false,
      isCameraNotSupported: false
    }
  },
  props: [
    'value'
  ],
  mounted () {
    this.isiOS = false
    this.isCameraNotSupported = false
    if (!window.cordova && utils.isiOS()) {
      this.isiOS = true
    }
    if (!utils.isCameraSupport) {
      this.isCameraNotSupported = true
    }
  },
  methods: {
    close () {
      this.dialog = false
    }
  },
  watch: {
    value () {
      if (this.value && (this.isiOS || this.isCameraNotSupported)) {
        this.dialog = true
      }
    }
  }
}
</script>
