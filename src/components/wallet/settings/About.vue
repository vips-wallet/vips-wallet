<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-list three-line subheader>
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title v-t="'settings.about_detail.name'"></v-list-tile-title>
            <v-list-tile-sub-title>VIPS Wallet</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title v-t="'settings.about_detail.version'"></v-list-tile-title>
            <v-list-tile-sub-title>1.1.0</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title v-t="'settings.about_detail.license'"></v-list-tile-title>
            <v-list-tile-sub-title><a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">GNU General Public License (version 3)</a></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile avatar>
          <v-list-tile-content>
            <v-list-tile-title v-t="'settings.about_detail.sourcecode'"></v-list-tile-title>
            <v-list-tile-sub-title><a href="https://github.com/vips-wallet/vips-wallet" target="_blank">GitHub</a></v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-flex>
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
</style>

<script>
export default {
  name: 'WalletSettingsAbout',
  data () {
    return {
    }
  },
  mounted () {
    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false,
      back: true
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.about'))

    this.$globalEvent.$on('back-button-pushed', this.backButtonPushed)
  },
  destroyed () {
    this.$globalEvent.$off('back-button-pushed', this.backButtonPushed)
  },
  methods: {
    backButtonPushed () {
      this.$router.push('/wallet/settings')
    }
  }
}
</script>
