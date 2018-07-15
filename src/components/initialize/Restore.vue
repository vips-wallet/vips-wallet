<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-toolbar tabs>
        <v-btn icon @click.native="$router.push('start')">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title v-t="'initialize.restore_wallet'"></v-toolbar-title>
        <v-tabs grow v-model="tab" slot="extension" @input="changeTab()">
          <v-tab key="phrase">{{ $t('initialize.restore_phrase') }}</v-tab>
          <v-tab key="qrcode">{{ $t('initialize.restore_qrcode') }}</v-tab>
        </v-tabs>
      </v-toolbar>
      <v-tabs-items v-model="tab">
        <v-tab-item key="phrase">
          <v-card flat>
            <v-layout row>
              <v-flex xs10 sm8 offset-sm2 offset-xs1>
                <v-card flat>
                  <v-card-text v-t="'initialize.restore_phrase_description'"></v-card-text>
                  <v-list>
                    <v-list-tile
                      v-for="(word, i) in words"
                      :key="i"
                    >
                      <v-list-tile-content>
                        <v-select
                          :items="phrases"
                          v-model="words[i]"
                          @input="add()"
                          autocomplete
                        ></v-select>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn icon v-if="i < (words.length - 1)" @click.native="remove(i)">
                          <v-icon>close</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>
                  </v-list>
                </v-card>
              </v-flex>
            </v-layout>
            <v-layout row class="mt-3 mb-3">
              <v-flex xs10 sm8 offset-sm2 offset-xs1>
                <v-card flat>
                  <v-card-text v-t="'initialize.password_description'"></v-card-text>
                  <div>
                    <v-text-field
                      v-model="password"
                      :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                      :append-icon-cb="() => (password_visible = !password_visible)"
                      :rules="[
                        () => {return this.password.length < 8 ? $t('initialize.password_less_length') : true},
                        () => {return this.password.match(/^[a-zA-Z0-9!@#$%^&*]+$/) ? true : $t('initialize.password_use_invalid_word')}
                      ]"
                      :type="password_visible ? 'text' : 'password'"
                      :label="$t('initialize.password')"
                      maxlength=25
                      counter
                    ></v-text-field>
                  </div>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
        </v-tab-item>
        <v-tab-item key="qrcode">
          <v-card flat>
            <v-layout row>
              <v-flex xs10 sm8 offset-sm2 offset-xs1>
                <v-card flat>
                  <v-card flat>
                    <scanner
                      v-if="show_camera"
                      @initError="onCameraInitError"
                      @loadFileError="onLoadQRCodeImageError"
                      @finish="onCameraFinish"
                    ></scanner>
                  </v-card>
                </v-card>
              </v-flex>
            </v-layout>
            <v-layout row class="mt-3 mb-3">
              <v-flex xs10 sm8 offset-sm2 offset-xs1>
                <v-card flat>
                  <v-card-text v-t="'initialize.qrcode_password_description'"></v-card-text>
                  <div>
                    <v-text-field
                      v-model="password"
                      :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                      :append-icon-cb="() => (password_visible = !password_visible)"
                      :rules="[
                        () => {return this.password.length < 8 ? $t('initialize.password_less_length') : true},
                        () => {return this.password.match(/^[a-zA-Z0-9!@#$%^&*]+$/) ? true : $t('initialize.password_use_invalid_word')}
                      ]"
                      :type="password_visible ? 'text' : 'password'"
                      :label="$t('initialize.password')"
                      maxlength=25
                      counter
                    ></v-text-field>
                  </div>
                </v-card>
              </v-flex>
            </v-layout>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-flex>
    <v-footer fixed height="auto">
      <v-flex xs12 sm8 offset-sm2>
        <v-layout row wrap justify-center>
          <v-btn
            block
            color="primary"
            :loading="progress"
            :disabled="!complete"
            @click.native="generate"
            v-t="'initialize.restore'"
          ></v-btn>
        </v-layout>
      </v-flex>
    </v-footer>
  </v-layout>
</template>

<style>
</style>

<script>
import Scanner from '@/components/Scanner'
import utils from '@/utils/utils'

export default {
  name: 'Restore',
  components: {
    Scanner
  },
  data () {
    return {
      tab: null,
      password: '',
      password_visible: false,
      words: [
        ''
      ],
      phrases: require('bip39').wordlists.english,
      progress: false,
      show_camera: false,
      qrcode_data: {}
    }
  },
  mounted () {
  },
  computed: {
    complete () {
      return (this.words.length >= 12 || (this.qrcode_data.entropy && this.qrcode_data.seed)) && this.password.match(/^[a-zA-Z0-9!@#$%^&*]+$/) && this.password.length >= 8 && !this.progress
    },
    mnemonic () {
      return this.words.join(' ').trim()
    }
  },
  methods: {
    add () {
      if (this.words[this.words.length - 1] !== '') {
        this.words.push('')
      }
    },
    remove (index) {
      this.words.splice(index, 1)
    },
    generate () {
      this.progress = true
      utils.wait().then(() => {
        if (this.words.length >= 12) {
          return this.$store.dispatch('importMnemonic', {
            mnemonic: this.mnemonic,
            password: this.password
          })
        } else if (this.qrcode_data.entropy && this.qrcode_data.seed) {
          return this.$store.dispatch('importEntropy', {
            entropy: this.qrcode_data.entropy,
            seed: this.qrcode_data.seed,
            password: this.password
          })
        } else {
          return Promise.reject(new Error('must mnemonic or qrcode'))
        }
      }).then(() => {
        localStorage.setItem('wallets', this.$store.state.walletGroup.stringify())
        this.$router.push('/wallet/home')
      }).catch(error => {
        this.$globalEvent.$emit('open-error-dialog', this.$t('initialize.import_failed'))
        this.progress = false
        console.error(error)
      })
    },
    onCameraInitError () {
      this.qrcode_data = {}
      this.$globalEvent.$emit('open-error-dialog', this.$t('common.camera_initialize_error'))
    },
    onLoadQRCodeImageError () {
      this.qrcode_data = {}
      this.$globalEvent.$emit('open-error-dialog', this.$t('common.invalid_image'))
    },
    onCameraFinish (data) {
      try {
        let keys = JSON.parse(data)
        if (keys.entropy && keys.seed) {
          this.qrcode_data = keys
        } else {
          this.$globalEvent.$emit('open-error-dialog', this.$t('common.invalid_image'))
        }
      } catch (e) {
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.invalid_image'))
        console.error(e)
      }
    },
    changeTab () {
      this.qrcode_data = {}
      if (this.tab === '1') {
        if (window.cordova) {
          let permissions = window.cordova.plugins.permissions
          permissions.checkPermission(
            permissions.CAMERA,
            (stat) => {
              if (stat.hasPermission) {
                this.show_camera = true
              } else {
                permissions.requestPermission(
                  permissions.CAMERA,
                  (stat) => {
                    if (stat.hasPermission) {
                      this.show_camera = true
                    } else {
                      this.$globalEvent.$emit('open-error-dialog', this.$t('common.camera_not_permitted'))
                      this.show_camera = false
                    }
                  },
                  () => {
                    this.$globalEvent.$emit('open-error-dialog', this.$t('common.camera_not_permitted'))
                    this.show_camera = false
                  }
                )
              }
            },
            null
          )
        } else {
          this.show_camera = true
        }
      } else {
        this.show_camera = false
      }
    }
  }
}
</script>
