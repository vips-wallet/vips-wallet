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
              <v-btn
                block
                v-if="show_passphrase"
                @click="hideMnemonic"
                color="primary"
                v-t="'settings.backup.hide_passphrase'"
              ></v-btn>
              <v-btn
                block
                v-else
                :loading="showing"
                :disabled="password.length < 8"
                @click="showMnemonic"
                color="primary"
                v-t="'settings.backup.show_passphrase'"
              ></v-btn>
            </v-card-actions>
            <v-card-title v-if="show_passphrase">
              <v-layout row>
                <v-flex>
                  <v-subheader v-t="'settings.backup.qrcode'"></v-subheader>
                  <v-card flat>
                    <div class="qrcode-info">
                      <v-card-media
                        :src="qrcode"
                        alt="QRCode"
                        height="200px"
                        contain
                      >
                      </v-card-media>
                      <v-card-actions>
                        <v-btn block color="primary" dark v-t="'settings.backup.save_qrcode'" @click="saveQRCode()"></v-btn>
                      </v-card-actions>
                    </div>
                  </v-card>
                  <v-divider></v-divider>
                  <v-subheader v-t="'settings.backup.passphrase'"></v-subheader>
                  <v-list two-line subheader>
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
                </v-flex>
              </v-layout>
            </v-card-title>
          </v-card>
        </v-flex>
      </v-card>
    </v-flex>
    <v-snackbar
      bottom
      v-model="snackbar"
      :timeout="snackbar_timeout"
    >
      {{ $t('settings.backup.save_qrcode') }}
      <v-btn flat @click="snackbar = false" v-t="'common.close'">
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<style scoped>
.checked {
  text-decoration: line-through;
}
.qrcode-info {
  margin: 0 auto;
  text-align: center;
}
</style>

<script>
import utils from '@/utils/utils'
export default {
  name: 'WalletSettingsBackup',
  data () {
    return {
      check: [],
      error: false,
      password: '',
      password_visible: false,
      phrases: [],
      show_passphrase: false,
      showing: false,
      qrcode: '',
      snackbar: false,
      snackbar_timeout: 4000
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
      this.showing = true

      utils.getQRCode(JSON.stringify({
        entropy: this.$store.state.walletGroup.entropy,
        seed: this.$store.state.walletGroup.seed
      })).then(uri => {
        this.qrcode = uri
        return Promise.resolve()
      }).then(() => {
        return utils.wait()
      }).then(() => {
        this.phrases = this.$store.state.walletGroup.toMnemonic(this.password).split(' ')
        this.check = this.phrases.map((phrase, i) => false)
        this.show_passphrase = true
        this.password = ''
      }).catch(e => {
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.password_mismatch'))
        console.error(e)
        this.error = true
      }).finally(() => {
        this.showing = false
      })
    },
    hideMnemonic () {
      this.phrases = []
      this.check = []
      this.qrcode = ''
      this.show_passphrase = false
    },
    saveQRCode () {
      const blob = utils.base64ToBlob(this.qrcode)

      if (window.cordova) {
        let savedir
        let promise = Promise.resolve()
        if (window.cordova.platformId === 'android') {
          savedir = `${window.cordova.file.externalRootDirectory}/VIPS_Wallet`
          promise = new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(window.cordova.file.externalRootDirectory, resolve, reject)
          }).then(fs => {
            return new Promise((resolve, reject) => {
              fs.getDirectory(
                'VIPS_Wallet',
                {create: true},
                resolve,
                reject
              )
            })
          })
        } else {
          savedir = window.cordova.file.dataDirectory
        }

        promise.then(() => {
          return new Promise((resolve, reject) => {
            window.resolveLocalFileSystemURL(savedir, resolve, reject)
          }).then(fs => {
            return new Promise((resolve, reject) => {
              fs.getFile(
                'vips_wallet_backup.png',
                {create: true},
                resolve,
                reject
              )
            })
          }).then(fileEntry => {
            return new Promise((resolve, reject) => {
              fileEntry.createWriter((writer) => {
                writer.onwriteend = resolve
                writer.onerror = reject
                writer.write(blob)
              })
            })
          }).then(() => {
            this.snackbar = true
          }).catch(error => {
            this.$globalEvent.$emit('open-error-dialog', this.$t('settings.backup.error.save_qrcode'))
            console.error(error)
          })
        })
      } else if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, 'vips_wallet_backup.png')
      } else {
        let link = document.createElement('a')
        link.download = 'vips_wallet_backup.png'
        link.href = this.qrcode
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log(link)
      }
    }
  }
}
</script>
