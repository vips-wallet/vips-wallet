<template>
  <v-layout row wrap>
    <v-flex xs12 sm8 offset-sm2>
      <v-card flat>
        <v-flex xs10 sm8 offset-sm2 offset-xs1 wrap>
          <v-card flat>
            <v-card-text v-t="'settings.delete.description'"></v-card-text>
            <v-card-actions>
              <v-container class="wrap">
                <v-checkbox
                  class="wrappable-label"
                  :label="$t('settings.delete.confirm_make_backup')"
                  v-model="confirm_make_backup"
                  wrap
                ></v-checkbox>
                <v-checkbox
                  class="wrappable-label"
                  :label="$t('settings.delete.confirm_delete')"
                  v-model="confirm_delete"
                  wrap
                ></v-checkbox>
              </v-container>
            </v-card-actions>
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
              <v-btn block :disabled="!complete" @click="deleteWallet" v-t="'settings.delete.do_delete'"></v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialog" persistent max-width="400">
      <v-card>
        <v-card-text v-t="'settings.delete.complete'"></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="reload">{{ $t('common.finish') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<style>
.wrappable-label label{
  overflow: visible;
  white-space: normal;
}
</style>

<script>
export default {
  name: 'WalletSettingsDelete',
  data () {
    return {
      password: '',
      password_visible: false,
      confirm_make_backup: false,
      confirm_delete: false,
      dialog: false
    }
  },
  computed: {
    complete () {
      return (this.confirm_make_backup && this.confirm_delete && this.password.length >= 8)
    }
  },
  mounted () {
    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: false,
      camera: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('settings.delete_wallet'))
  },
  methods: {
    deleteWallet () {
      try {
        this.$store.state.walletGroup.toMnemonic(this.password)
        if (window.cordova) {
          window.plugins.touchid.isAvailable(
            (type) => {
              window.plugins.touchid.has(
                'password',
                () => {
                  window.plugins.touchid.delete(
                    'password',
                    () => {
                      this.$store.dispatch('deleteWallet')
                      this.dialog = true
                    },
                    () => {
                      this.$globalEvent.$emit('open-error-dialog', this.$t('settings.fingerprint_detail.error.faled_delete'))
                    }
                  )
                },
                () => {
                  this.$store.dispatch('deleteWallet')
                  this.dialog = true
                }
              )
            },
            (msg) => {
              this.$store.dispatch('deleteWallet')
              this.dialog = true
            }
          )
        } else {
          this.$store.dispatch('deleteWallet')
          this.dialog = true
        }
      } catch (e) {
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.password_mismatch'))
        console.error(e)
      }
    },
    reload () {
      if (window.cordova) {
        navigator.app.exitApp()
      } else {
        this.$router.push('/initialize/start')
      }
    }
  }
}
</script>
