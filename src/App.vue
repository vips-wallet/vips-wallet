<template>
  <v-app>
    <router-view/>
    <error-dialog>
    </error-dialog>
  </v-app>
</template>

<style>
.full-width-list-items .v-input__control {
  width: 100%;
}
</style>

<script>
import ErrorDialog from '@/components//ErrorDialog'
import utils from '@/utils/utils'

export default {
  name: 'App',
  components: {
    ErrorDialog
  },
  data () {
    return {
    }
  },
  mounted: function () {
    utils.walletExists().then(() => {
      this.$router.push('/wallet/home')
    }).catch(() => {
      this.$router.push('/initialize/start')
    })
  }
}
</script>
