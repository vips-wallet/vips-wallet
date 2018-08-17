<template>
  <v-content>
    <router-view/>
    <license-agreement/>
  </v-content>
</template>

<style>
</style>

<script>
import LicenseAgreement from '@/components/LicenseAgreement'

export default {
  name: 'Initialize',
  components: {
    LicenseAgreement
  },
  data () {
    return {
    }
  },
  mounted: function () {
    this.$router.push('start')
  }
}
</script>
