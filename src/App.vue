<template>
  <v-app>
    <router-view/>
    <error-dialog>
    </error-dialog>
  </v-app>
</template>

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
    if (utils.walletExists()) {
      this.$router.push('/wallet/home')
    } else {
      this.$router.push('/initialize/start')
    }
  }
}
</script>
