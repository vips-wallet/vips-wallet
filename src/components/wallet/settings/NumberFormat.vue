<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-radio-group v-model="number_format" :mandatory="false">
          <v-list three-line>
            <v-list-tile
              v-for="(item, i) in formats"
              :key="i"
              @click.stop="number_format = item.value"
            >
              <v-list-tile-action>
                <v-radio :value="item.value"></v-radio>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title v-html="item.text"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.example"></v-list-tile-sub-title>
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
export default {
  name: 'WalletSettingsNumberFormat',
  data () {
    return {
      formats: [
        {text: this.$t('settings.number_formats.plain'), value: 'PLAIN', example: '123456.78900000'},
        {text: this.$t('settings.number_formats.comma'), value: 'COMMA', example: '123,456.78900000'},
        {text: this.$t('settings.number_formats.space'), value: 'SPACE', example: '123 456.78900000'}
      ]
    }
  },
  computed: {
    number_format: {
      get () {
        return this.$store.state.numberFormat
      },
      set (value) {
        this.$store.commit('setNumberFormat', value)
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
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.change_number_format'))

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
