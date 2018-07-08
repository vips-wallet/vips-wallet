<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-radio-group v-model="currency" :mandatory="false">
          <v-list three-line>
            <v-list-tile
              v-for="(item, i) in currencies"
              :key="i"
              @click.stop="currency = item.value"
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
import CONST from '@/utils/const'

export default {
  name: 'WalletSettingsCurrency',
  data () {
    return {
      currencies: CONST.CURRENCIES.map(code => { return {text: this.$t(`settings.currency.${code}`), value: code} })
    }
  },
  computed: {
    currency: {
      get () {
        return this.$store.state.fiatCurrency
      },
      set (value) {
        this.$store.commit('setFiatCurrency', value)
        localStorage.setItem('currency', value)
      }
    }
  },
  mounted () {
    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.change_currency'))
  }
}
</script>
