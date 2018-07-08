<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-list three-line subheader>
          <v-list-tile @click="$router.push('/wallet/settings/locale')">
            <v-list-tile-action>
              <v-icon>language</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.change_locale'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="$router.push('/wallet/settings/currency')">
            <v-list-tile-action>
              <v-icon>attach_money</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.change_currency'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="$router.push('/wallet/settings/fingerprint')" v-if="enableTouchID">
            <v-list-tile-action>
              <v-icon>fingerprint</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.fingerprint'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="$router.push('/wallet/settings/backup')">
            <v-list-tile-action>
              <v-icon>settings_backup_restore</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.make_backup'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="$router.push('/wallet/settings/delete')">
            <v-list-tile-action>
              <v-icon>delete_forever</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.delete_wallet'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-divider></v-divider>
          <v-list-tile @click="$router.push('/wallet/settings/about')">
            <v-list-tile-action>
              <v-icon>info</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="'settings.about'"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
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
  name: 'WalletSettings',
  data () {
    return {
      enableTouchID: false
    }
  },
  mounted () {
    if (window.cordova) {
      window.plugins.touchid.isAvailable(
        (type) => {
          this.enableTouchID = true
        }
      )
    }
    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.description'))
  }
}
</script>
