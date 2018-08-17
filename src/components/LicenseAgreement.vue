<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600">
      <v-card>
        <v-card-title class="headline" v-t="'license.title'"></v-card-title>
        <v-card-text v-t="'license.message1'"></v-card-text>
        <v-card-text v-t="'license.message2'"></v-card-text>
        <v-card-text v-t="'license.message3'"></v-card-text>
        <v-card-text><a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" v-t="'license.link'"></a></v-card-text>
        <v-card-text><a href="https://github.com/vips-wallet/vips-wallet" target="_blank" v-t="'license.sourcecode'"></a></v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click.native="agree()" v-t="'common.agree'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<style scoped>
</style>

<script>
export default {
  data () {
    return {
      dialog: false,
      detail: '',
      callback: null
    }
  },
  mounted () {
    if (this.$store.state.agreement !== true) {
      this.dialog = true
    }
  },
  methods: {
    agree () {
      this.dialog = false
      this.$store.commit('agreement')
      this.$emit('agree')
    }
  }
}
</script>
