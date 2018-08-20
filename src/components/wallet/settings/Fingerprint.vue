<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-container>
          <v-layout row>
            <v-flex xs12>
              <v-switch
                :label="$t('settings.fingerprint_detail.enable')"
                v-model="enable"
                :disabled="!available"
              ></v-switch>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container>
          <v-layout center justify>
            <v-flex xs10 offset-xs1>
              <v-text-field
                v-model="password"
                :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                @click:append="() => (password_visible = !password_visible)"
                :rules="[
                  () => {return this.password.length < 8 ? $t('initialize.password_less_length') : true}
                ]"
                :type="password_visible ? 'text' : 'password'"
                :label="$t('common.input_password')"
                counter
              ></v-text-field>
            </v-flex>
          </v-layout>
        </v-container>
        <v-container>
          <v-layout row>
            <v-flex xs12>
              <v-btn block :disabled="!complete" @click="save()" v-t="'settings.fingerprint_detail.save'"></v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-snackbar
      bottom
      v-model="snackbar"
      :timeout="snackbar_timeout"
    >
      {{ $t('settings.fingerprint_detail.done') }}
      <v-btn flat @click="snackbar = false" v-t="'common.close'">
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<style scoped>
</style>

<script>

export default {
  name: 'WalletSettingsFingerprint',
  data () {
    return {
      available: false,
      enable: false,
      password: '',
      password_visible: false,
      snackbar: false,
      snackbar_timeout: 4000
    }
  },
  computed: {
    complete () {
      return this.available && this.password.length >= 8
    }
  },
  mounted () {
    this.isAvailable().then((res) => {
      this.available = true
      if (res.available) {
        this.enable = true
      } else {
        this.enable = false
      }
    }).catch(() => {
      this.available = false
    })

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false,
      back: true
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.fingerprint'))

    this.$globalEvent.$on('back-button-pushed', this.backButtonPushed)
  },
  destroyed () {
    this.$globalEvent.$off('back-button-pushed', this.backButtonPushed)
  },
  methods: {
    async isAvailable () {
      return new Promise((resolve, reject) => {
        if (window.cordova) {
          window.plugins.touchid.isAvailable(
            (type) => {
              window.plugins.touchid.has(
                'password',
                () => resolve({type: type, available: true}),
                () => resolve({type: type, available: false})
              )
            },
            (msg) => reject(new Error('this device does not support fingerprint auth'))
          )
        } else {
          reject(new Error('this device does not support fingerprint auth'))
        }
      })
    },
    save () {
      if (window.cordova) {
        try {
          this.$store.state.walletGroup.toMnemonic(this.password)
          if (this.enable) {
            window.plugins.touchid.save(
              'password',
              this.password,
              () => {
                this.snackbar = true
              },
              () => {
                this.$globalEvent.$emit('open-error-dialog', this.$t('settings.fingerprint_detail.error.faled_save'))
              }
            )
          } else {
            window.plugins.touchid.delete(
              'password',
              () => {
                this.snackbar = true
              },
              () => {
                this.$globalEvent.$emit('open-error-dialog', this.$t('settings.fingerprint_detail.error.faled_delete'))
              }
            )
          }
        } catch (e) {
          this.$globalEvent.$emit('open-error-dialog', this.$t('common.password_mismatch'))
          console.error(e)
        }
      } else {
        this.$globalEvent.$emit('open-error-dialog', this.$t('settings.fingerprint_detail.error.not_supported'))
        this.enable = false
        this.available = false
      }
    },
    backButtonPushed () {
      this.$router.push('/wallet/settings')
    }
  }
}
</script>
