<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-tabs grow v-model="tab" slot="extension" @input="changeTab()">
        <v-tab key="sign">{{ $t('sign.sign') }}</v-tab>
        <v-tab key="verify">{{ $t('sign.verify') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item key="sign">
          <v-card flat>
            <v-container>
              <v-layout row>
                <v-flex xs12>
                  <v-select
                    cache-items
                    single-line
                    bottom
                    :label="$t('sign.sign_address')"
                    v-model="sign_address"
                    :items="addresses"
                    class="shorten"
                    ></v-select>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-textarea
                    solo
                    name="sign_message"
                    :label="$t('sign.message')"
                    value=""
                    v-model="sign_message"
                  ></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>
            <v-card-actions>
              <v-btn block color="primary" :disabled="sign_ready" v-t="'sign.sign'" @click="signMessage()"></v-btn>
            </v-card-actions>
            <v-divider></v-divider>
            <v-container v-if="sign_result">
              <v-card-title v-t="'sign.sign_result'"></v-card-title>
              <v-card-text class="wrap" @click="copyClipBoard()">
                {{ sign_result }}
              </v-card-text>
            </v-container>
            <v-card-actions v-if="sign_result">
              <v-btn block color="primary" dark v-t="'sign.copy_sign'" @click="copyClipBoard()"></v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
        <v-tab-item key="verify">
          <v-card flat>
            <v-container>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    id="verify_address"
                    name="address"
                    :label="$t('sign.verify_address')"
                    :rules="[
                      () => checkValidAddress(true) || $t('sign.error.required_valid_address')
                    ]"
                    v-model="verify_address"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-textarea
                    solo
                    name="verify_message"
                    :label="$t('sign.message')"
                    value=""
                    v-model="verify_message"
                  ></v-textarea>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-textarea
                    solo
                    name="verify_sign"
                    :label="$t('sign.verify_sign')"
                    value=""
                    v-model="verify_sign"
                  ></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>
            <v-card-actions>
              <v-btn block color="primary" :disabled="verify_ready" v-t="'sign.verify'" @click="verifyMessage()"></v-btn>
            </v-card-actions>
            <v-divider></v-divider>
            <v-container v-if="verified">
              <v-alert :value="true" type="success" v-if="verify_success" v-t="'sign.verify_success'"></v-alert>
              <v-alert :value="true" type="error" v-else v-t="'sign.verify_failed'"></v-alert>
            </v-container>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-flex>
    <v-dialog v-model="confirmation" persistent scrollable max-width="500px">
      <v-card>
        <v-card-title class="headline" primary-title v-t="'common.input_password'"></v-card-title>
        <v-layout center justify>
          <v-flex xs10 offset-xs1>
            <v-text-field
              v-model="password"
              :append-icon="password_visible ? 'visibility' : 'visibility_off'"
              @click:append="togglePasswordVisible()"
              :rules="[
              () => {return (this.password.length < 8 && this.password.length > 0) ? $t('initialize.password_less_length') : true}
              ]"
              :type="password_visible ? 'text' : 'password'"
              :label="$t('common.input_password')"
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-card-actions>
          <v-btn block color="primary" @click.native="cancel()" v-t="'common.cancel'"></v-btn>
          <v-btn block color="primary" :disabled="password.length < 8" @click.native="doSign()" v-t="'sign.sign'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      bottom
      v-model="snackbar"
      :timeout="snackbar_timeout"
    >
      {{ $t('common.copy_clipboard') }}
      <v-btn flat @click="snackbar = false" v-t="'common.close'">
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<style scoped>
.shorten {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -webkit-text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
.wrap {
  word-break : break-all;
  overflow-wrap: break-word;
}
</style>

<script>
import {address, NETWORKS} from 'vipstarcoinjs-wallet-core'
import utils from '@/utils/utils'

export default {
  name: 'WalletSign',
  data () {
    return {
      sign_address: null,
      addresses: [],
      confirmation: false,
      password: '',
      password_visible: false,
      sign_message: '',
      sign_result: '',
      snackbar: false,
      snackbar_timeout: 4000,
      tab: null,
      verify_address: '',
      verify_message: '',
      verify_sign: '',
      verified: false,
      verify_success: false,
      is_fingerprint: false
    }
  },
  computed: {
    sign_ready: {
      get () {
        return !(this.sign_address !== '' && this.sign_message !== '')
      }
    },
    verify_ready: {
      get () {
        return !(this.verify_address !== '' && this.verify_address !== '' && this.verify_sign !== '')
      }
    }
  },
  mounted () {
    if (this.$store.state.account !== null) {
      this.sign_address = this.$store.state.account.getDefaultReceiveAddress()
      this.addresses = this.$store.state.account.addresses.map(addr => addr.external)
    }

    this.$globalEvent.$on('delete-button-pushed', this.deleteButtonPushed)

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: true,
      refresh: false,
      camera: false,
      back: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('sign.description'))
  },
  destroyed () {
    this.$globalEvent.$off('delete-button-pushed', this.deleteButtonPushed)
  },
  methods: {
    cancel () {
      this.password = ''
      this.confirmation = false
    },
    changeTab () {
    },
    checkValidAddress (allowEmpty) {
      if (allowEmpty && this.verify_address === '') {
        return true
      }
      return address.isValidAddress(this.verify_address, NETWORKS[this.$store.state.network])
    },
    copyClipBoard () {
      if (utils.copyClipBoard(this.sign_result)) {
        this.snackbar = true
      }
    },
    deleteButtonPushed () {
      this.sign_address = this.$store.state.account.getDefaultReceiveAddress()
      this.sign_message = ''
      this.sign_result = ''
      this.verify_address = ''
      this.verify_address = ''
      this.verify_sign = ''
      this.verified = false
      this.verify_success = false
      this.password = ''
    },
    doSign () {
      try {
        this.sign_result = this.$store.state.account.signMessageWithAddress(this.sign_address, this.sign_message, this.password)
      } catch (e) {
        console.error(e)
        this.$globalEvent.$emit('open-error-dialog', this.$t('sign.error.sign_failed'))
      }
      this.confirmation = false
      this.password = ''
    },
    signMessage () {
      utils.verifyTouchID().then((password) => {
        if (password) {
          this.password_visible = false
          this.is_fingerprint = true
          this.password = password
          this.doSign()
        } else {
          this.confirmation = true
          this.is_fingerprint = false
        }
      }).catch(e => {
        console.log(e)
        this.confirmation = true
        this.is_fingerprint = false
      })
    },
    togglePasswordVisible () {
      if (this.is_fingerprint) {
        this.password_visible = false
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.password_not_show'))
      } else {
        this.password_visible = !this.password_visible
      }
    },
    verifyMessage () {
      this.verified = true
      this.verify_success = this.$store.state.account.verifySignedMessage(this.verify_message, this.verify_address, this.verify_sign)
    }
  },
  watch: {
    verify_address () {
      this.verified = false
    },
    verify_message () {
      this.verified = false
    },
    verify_sign () {
      this.verified = false
    }
  }
}
</script>
