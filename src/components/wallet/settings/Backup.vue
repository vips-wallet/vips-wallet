<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-card flat>
        <v-flex xs10 sm8 offset-sm2 offset-xs1>
          <v-card flat>
            <v-card-text v-t="'initialize.your_passphrase_description'"></v-card-text>
            <v-card flat>
              <v-text-field
                v-model="password"
                :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (password_visible = !password_visible)"
                :rules="[
                  () => {return (this.password !== '' && this.password.length < 8) ? $t('initialize.password_less_length') : true}
                ]"
                :type="password_visible ? 'text' : 'password'"
                :label="$t('initialize.password')"
                counter
              ></v-text-field>
            </v-card>
            <v-card-actions>
              <v-btn block v-if="show_passphrase" @click="hideMnemonic" v-t="'settings.backup.hide_passphrase'"></v-btn>
              <v-btn block v-else :disabled="password.length < 8" @click="showMnemonic" v-t="'settings.backup.show_passphrase'"></v-btn>
            </v-card-actions>
            <v-card-title>
              <v-list two-line subheader v-if="show_passphrase">
                <v-list-tile
                  avatar
                  v-for="(phrase, i) in phrases"
                  :key="i"
                >
                  <v-list-tile-action>
                    <v-checkbox v-model="check[i]"></v-checkbox>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title :class="check[i] ? 'checked' : ''">{{ phrase }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.checked {
  text-decoration: line-through;
}
</style>

<script>
export default {
  name: 'WalletSettingsBackup',
  data () {
    return {
      check: [],
      error: false,
      password: '',
      password_visible: false,
      phrases: [],
      show_passphrase: false
    }
  },
  mounted () {
    this.check = []
    this.error = false
    this.password = ''
    this.phrases = []
    this.show_passphrase = false

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.make_backup'))
  },
  computed: {
    complete () {
      return (this.check.length > 0 && this.check.every(c => c === true))
    }
  },
  methods: {
    showMnemonic () {
      this.error = false
      try {
        this.phrases = this.$store.state.walletGroup.toMnemonic(this.password).split(' ')
        this.check = this.phrases.map((phrase, i) => false)
        this.show_passphrase = true
        this.password = ''
      } catch (e) {
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.password_mismatch'))
        console.error(e)
        this.error = true
      }
    },
    hideMnemonic () {
      this.phrases = []
      this.check = []
      this.show_passphrase = false
    }
  }
}
</script>
