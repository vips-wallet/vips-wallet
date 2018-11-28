<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="400">
      <v-card>
        <v-card-title class="headline" v-t="'common.error'"></v-card-title>
        <v-card-text>{{ detail }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="close()" v-t="'common.close'"></v-btn>
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
    this.$globalEvent.$on('open-error-dialog', (opt) => {
      this.dialog = true
      if (typeof opt === 'string') {
        this.detail = opt
      } else if (opt.detail && opt.callback) {
        this.detail = opt.detail
        this.callback = opt.callback
      }
    })
    this.$globalEvent.$on('close-error-dialog', () => {
      this.dialog = false
    })
  },
  methods: {
    submit () {
      this.dialog = false
    },
    close () {
      this.dialog = false
      if (this.callback) {
        this.callback()
      }
    }
  },
  watch: {
    dialog () {
      if (this.dialog === false) {
        this.$globalEvent.$emit('error-dialog-closed')
      }
    }
  }
}
</script>
