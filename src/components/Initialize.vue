<template>
  <v-content>
    <router-view/>
    <license-agreement @agree="onAgree()"/>
    <limit-notify v-model="notify"/>
  </v-content>
</template>

<style>
</style>

<script>
import LicenseAgreement from '@/components/LicenseAgreement'
import LimitNotify from '@/components/LimitNotify'

export default {
  name: 'Initialize',
  components: {
    LicenseAgreement,
    LimitNotify
  },
  data () {
    return {
      notify: false
    }
  },
  mounted: function () {
    if (this.$store.state.agreement) {
      this.notify = true
    }
    this.$router.push('start')
  },
  methods: {
    onAgree () {
      this.notify = true
    }
  }
}
</script>
