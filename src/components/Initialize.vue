<template>
  <v-content>
    <router-view/>
  </v-content>
</template>

<style>
</style>

<script>
export default {
  name: 'Initialize',
  data () {
    return {
    }
  },
  mounted: function () {
    this.$router.push('start')
  }
}
</script>
