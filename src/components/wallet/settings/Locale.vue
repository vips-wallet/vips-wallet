<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-radio-group class="full-width-list-items" v-model="locale" :mandatory="false">
          <v-list three-line>
            <v-list-tile
              v-for="(item, i) in locales"
              :key="i"
              @click.stop="locale = item.value"
            >
              <v-list-tile-action>
                <v-radio :value="item.value"></v-radio>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-html="item.text"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-radio-group>
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
import storage from '@/storage'

export default {
  name: 'WalletSettingsLocale',
  data () {
    return {
      locales: [
        {text: this.$t('settings.locale.japanese'), value: 'ja'},
        {text: this.$t('settings.locale.english'), value: 'en'},
        {text: this.$t('settings.locale.german'), value: 'de'}
      ]
    }
  },
  computed: {
    locale: {
      get () {
        return this.$i18n.locale
      },
      set (value) {
        storage.setItem('locale', value).then(() => {
          this.$i18n.locale = value
        })
      }
    }
  },
  mounted () {
    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false,
      back: true
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.change_locale'))

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
