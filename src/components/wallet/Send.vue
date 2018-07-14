<template>
  <v-layout justify center>
    <v-layout row>
      <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
        <scanner
          v-if="show_camera"
          @initError="onCameraInitError"
          @loadFileError="onLoadQRCodeImageError"
          @finish="onCameraFinish"
        ></scanner>
        <v-layout row wrap justify-center v-else-if="!loaded">
          <div class="mt-5">
            <v-progress-circular indeterminate :size="50" color="amber"></v-progress-circular>
          </div>
        </v-layout>
        <v-card v-else>
          <v-container>
            <v-layout row>
              <v-list subheader three-line>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title v-t="'send.available_balance'"></v-list-tile-title>
                    <v-list-tile-sub-title>{{ balance.toString() }} VIPS</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile v-if="receiver_message != ''">
                  <v-list-tile-content>
                    <v-list-tile-title v-t="'send.receiver_message'"></v-list-tile-title>
                    <v-list-tile-sub-title>{{ receiver_message }}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  id="address"
                  name="address"
                  :label="$t('send.receiver_address')"
                  :rules="[
                    () => checkValidAddress(true) || $t('send.error.required_valid_address')
                  ]"
                  v-model="address"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs8>
                <v-text-field
                  id="amount"
                  name="amount"
                  :label="$t('send.amount')"
                  v-model="amount"
                  @focus="onAmount"
                  :rules="[
                    () => checkValidNumber(amount, 8, true) || $t('send.error.required_valid_amount'),
                    () => checkDust(amount) || $t('send.error.required_over_dust', {dust: dust.toString()})
                  ]"
                ></v-text-field>
              </v-flex>
              <v-flex xs4>
                <v-subheader>VIPS</v-subheader>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs8>
                <v-text-field
                  id="fiat"
                  name="fiat"
                  :label="$t('send.fiat')"
                  v-model="fiat"
                  @focus="onFiat"
                  :rules="[
                    () => checkValidNumber(fiat, -1, true) || $t('send.error.required_valid_fiat')
                  ]"
                ></v-text-field>
              </v-flex>
              <v-flex xs4>
                <v-select
                  :items="currencies"
                  v-model="amountType"
                  autocomplete
                ></v-select>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  id="message"
                  name="message"
                  :label="$t('send.message')"
                  :disabled="include_rate"
                  :rules="[
                    () => checkValidMessage() || $t('send.error.required_valid_message')
                  ]"
                  v-model="message"
                  @input="include_rate = false"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-checkbox
                  :label="$t('send.include_rate')"
                  :disabled="message != ''"
                  v-model="include_rate"
                  @input="message = ''"
                ></v-checkbox>
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-btn block :disabled="!ready" :loading="building" color="primary" @click.native="confirm()" v-t="'send.confirm'"></v-btn>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
    <v-dialog v-model="confirmation" persistent scrollable max-width="500px">
      <v-card>
        <v-card-title v-t="'send.confirm'"></v-card-title>
        <v-divider></v-divider>
        <v-card-text style="max-height: 600px;" id="txdetail">
          <v-list three-line subheader>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.receiver_address'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ address }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.amount'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ amount }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.fiat'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ fiat }} {{ amountType }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.txfee'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ txfee }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile v-if="message != ''">
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.message'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ message }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="message != ''"></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'send.include_rate'"></v-list-tile-title>
                <v-list-tile-sub-title v-if="include_rate" v-t="'common.yes'"></v-list-tile-sub-title>
                <v-list-tile-sub-title v-else v-t="'common.no'"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
        <v-layout center justify>
          <v-flex xs10 offset-xs1>
            <v-text-field
              v-model="password"
              :append-icon="password_visible ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (password_visible = !password_visible)"
              :rules="[
              () => {return (this.password.length < 8 && this.password.length > 0) ? $t('initialize.password_less_length') : true}
              ]"
              :type="password_visible ? 'text' : 'password'"
              :label="$t('common.input_password')"
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-card-actions>
          <v-btn block color="primary" :disabled="sending" @click.native="cancel()" v-t="'common.cancel'"></v-btn>
          <v-btn block color="primary" :loading="sending" :disabled="sending" @click.native="send()" v-t="'send.send'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="error" max-width="500px">
      <v-card>
        <v-card-text v-if="update_error" v-t="'send.error.update_balance_failed'"></v-card-text>
        <v-card-text v-if="build_error" v-t="'send.error.build_transaction_failed'"></v-card-text>
        <v-card-text v-if="send_error" v-t="'send.error.send_transaction_failed'"></v-card-text>
        <v-card-text v-if="error_detail != ''">( {{error_detail}} )</v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="error = false" v-t="'common.close'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="success" max-width="600px">
      <v-card>
        <v-card-text v-t="'send.finish'"></v-card-text>
        <v-card-text class="scrollable">{{ txid }}</v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="complete()" v-t="'common.close'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
button.btn.primary {
  color: #000000;
}
div.slider__thumb.primary {
  background-color: #000000 !important;
  border-color: #000000 !important;
}
.scrollable {
  overflow-x: scroll;
}
</style>

<script>
import Scanner from '@/components/Scanner'
import {BigNumber} from 'bignumber.js'
import {address, messageutil, NETWORKS} from 'vipstarcoinjs-wallet-core'
import CONST from '@/utils/const'
import utils from '@/utils/utils'

export default {
  name: 'WalletSend',
  components: {
    Scanner
  },
  data () {
    return {
      paused: false,
      loaded: false,
      password: '',
      password_visible: false,
      balance: new BigNumber(0),
      address: '',
      amount: '',
      fiat: '',
      fiatRate: this.$store.state.price,
      txfee: 0.004,
      focused: '',
      message: '',
      include_rate: false,
      confirmation: false,
      camera_error: false,
      send_error: false,
      build_error: false,
      update_error: false,
      error_detail: '',
      success: false,
      show_camera: false,
      txBuilder: null,
      addressPath: [],
      txid: '',
      currencies: CONST.CURRENCIES,
      amountType: this.$store.state.fiatCurrency,
      dust: new BigNumber(CONST.DUST_RELAY_TX_FEE),
      receiver_message: '',
      building: false,
      sending: false,
      camera_config: CONST.QRCODE_CAMERA_CONFIG
    }
  },
  mounted () {
    this.$globalEvent.$on('wallet-info-updated', this.walletInfoUpdated)
    this.$globalEvent.$on('do-update-wallet-info', this.doUpdateWalletInfo)
    this.$globalEvent.$on('error-update-wallet-info', this.errorUpdateWalletInfo)
    this.$globalEvent.$on('delete-button-pushed', this.deleteButtonPushed)
    this.$globalEvent.$on('camera-button-pushed', this.cameraButtonPushed)

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: true,
      refresh: true,
      camera: true
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('send.description'))
    this.$globalEvent.$emit('do-update-wallet-info')

    if (this.$store.state.uri) {
      this.waitSetURI()
    }
  },
  destroyed () {
    this.$globalEvent.$off('wallet-info-updated', this.walletInfoUpdated)
    this.$globalEvent.$off('do-update-wallet-info', this.doUpdateWalletInfo)
    this.$globalEvent.$off('error-update-wallet-info', this.errorUpdateWalletInfo)
    this.$globalEvent.$off('delete-button-pushed', this.deleteButtonPushed)
    this.$globalEvent.$off('camera-button-pushed', this.cameraButtonPushed)
  },
  computed: {
    error: {
      get () {
        return (this.camera_error || this.update_error || this.build_error || this.send_error)
      },
      set (value) {
        this.camera_error = value
        this.update_error = value
        this.build_error = value
        this.send_error = value
        this.error_detail = ''
      }
    },
    ready: {
      get () {
        return this.balance.comparedTo(0) === 1 && this.checkValidAddress() && this.checkValidNumber(this.amount, 8) && this.amount !== '' && this.checkDust() && !this.building
      }
    }
  },
  methods: {
    walletInfoUpdated () {
      this.balance = this.$store.state.walletInfo.balance
      this.fiatRate = this.$store.state.price
      this.$store.state.account.estimateFee().then(feeRate => {
        let fee = new BigNumber(feeRate)
        this.txfee = fee.dividedBy(1e8).toNumber(8)
        this.loaded = true
      }).catch(error => {
        this.update_error = true
        this.error_detail = error.message
      })
    },
    doUpdateWalletInfo () {
      this.loaded = false
    },
    errorUpdateWalletInfo (error) {
      this.update_error = true
      this.error_detail = error.message
    },
    onAmount () {
      this.focused = 'amount'
    },
    onFiat () {
      this.focused = 'fiat'
    },
    waitSetURI () {
      if (!this.loaded) {
        setTimeout(this.waitSetURI, 500)
      } else {
        this.setURI()
      }
    },
    setURI () {
      let uri = this.$store.state.uri
      if (!uri) {
        this.$globalEvent.$emit('open-error-dialog', this.$t('common.invalid_uri_format'))
        return
      }
      this.address = uri.address
      let amount = ''
      if (uri.options.amountExt && uri.options.amountType) {
        if (CONST.CURRENCIES.includes(uri.options.amountType)) {
          let oldAmountType = this.amountType
          this.amountType = uri.options.amountType
          utils.getTicker(uri.options.amountType).then(resp => {
            let quote = resp.data.quotes[uri.options.amountType]
            if (quote === null) {
              this.$globalEvent.$emit('open-error-dialog', this.$t('common.currency_is_not_supported', {amountType: uri.options.amountType}))
              if (uri.options.amount) {
                this.amountType = oldAmountType
                amount = new BigNumber(uri.options.amount)
                this.focused = 'amount'
                this.amount = amount.dp(8).toString()
                this.fiat = this.toFiat(new BigNumber(this.amount))
              }
            } else {
              this.fiatRate = new BigNumber(quote.price)
              this.focused = 'fiat'
              this.amount = this.toAmount(new BigNumber(uri.options.amountExt))
              this.fiat = uri.options.amountExt
            }
          })
        } else {
          this.$globalEvent.$emit('open-error-dialog', this.$t('common.currency_is_not_supported', {amountType: uri.options.amountType}))
          if (this.$store.state.uri.options.amount) {
            amount = new BigNumber(uri.options.amount)
            this.focused = 'amount'
            this.amount = amount.dp(8).toString()
            this.fiat = this.toFiat(new BigNumber(this.amount))
          }
        }
      } else if (uri.options.amount) {
        amount = new BigNumber(uri.options.amount)
        this.focused = 'amount'
        this.amount = amount.dp(8).toString()
        this.fiat = this.toFiat(new BigNumber(this.amount))
      }

      this.receiver_message = uri.options.message ? uri.options.message : ''

      this.$store.commit('setURI', null)
    },
    checkValidAddress (allowEmpty = false) {
      if (allowEmpty && this.address === '') {
        return true
      }
      return address.isValidAddress(this.address, NETWORKS[this.$store.state.network])
    },
    checkValidNumber (n, decimals = -1, allowEmpty) {
      if (allowEmpty && n === '') {
        return true
      }
      if (!n) {
        return false
      }
      let regexp = /^([1-9]\d*|0)(\.\d+)?$/
      if (decimals === 0) {
        regexp = /^([1-9]\d*|0)$/
      } else if (decimals !== -1) {
        regexp = new RegExp(`^([1-9]\\d*|0)(\\.\\d{1,${decimals}})?$`)
      }
      if (n.match(regexp) || n === '') {
        return true
      }
      return false
    },
    checkValidMessage () {
      return messageutil.isValidMessage(this.message)
    },
    checkDust () {
      return this.dust.comparedTo(this.amount) < 1
    },
    confirm () {
      this.building = true
      let opt = {
        feeRate: 0.0000045
      }
      if (this.message || this.include_rate) {
        opt.extra_data = []
        opt.feeRate = 0.000005
      }
      if (this.message) {
        opt.extra_data.push({
          address: messageutil.encode(this.message),
          value: 0
        })
        if (this.amount === '') {
          this.amount = 0
          this.fiat = 0
        }
      }
      if (this.include_rate) {
        opt.extra_data.push({
          address: messageutil.encode(`v1.0.0|RATE|${this.amountType}|${this.fiatRate.toString()}`),
          value: 0
        })
      }

      utils.wait().then(() => {
        return this.$store.state.account.buildTransactionData(this.address, new BigNumber(this.amount), opt)
      }).then(({txBuilder, addressPath, fee}) => {
        this.txBuilder = txBuilder
        this.addressPath = addressPath
        this.txfee = (new BigNumber(fee)).dividedBy(1e8).dp(8).toNumber()

        utils.verifyTouchID().then((password) => {
          this.password = password
          this.confirmation = true
        }).catch(e => {
          console.log(e)
          this.confirmation = true
        })
      }).catch(error => {
        this.build_error = true
        this.error_detail = error.message
        console.error(error)
      }).finally(() => {
        this.building = false
      })
    },
    cancel () {
      document.getElementById('txdetail').scrollTop = 0
      this.txBuilder = null
      this.addressPath = []
      this.txfee = 0
      this.password = ''
      this.confirmation = false
    },
    send () {
      this.sending = true
      try {
        utils.wait().then(() => {
          let signed = this.$store.state.account.signTransaction(this.txBuilder, this.addressPath, this.password)
          console.log(signed.toHex())
          this.password = ''
          return this.$store.state.account.sendRawTransaction(signed.toHex())
        }).then(resp => {
          this.clear()
          this.txid = resp.txid
          this.success = true
        }).catch(error => {
          this.send_error = true
          this.error_detail = error.message
          console.error(error)
        }).finally(() => {
          document.getElementById('txdetail').scrollTop = 0
          this.sending = false
          this.clear()
        })
      } catch (e) {
        document.getElementById('txdetail').scrollTop = 0
        this.sending = false
        this.send_error = true
        console.error(e)
        this.clear()
      }
    },
    clear () {
      this.password = ''
      this.address = ''
      this.amount = ''
      this.fiat = ''
      this.txfee = 0.004
      this.focused = ''
      this.message = ''
      this.include_rate = false
      this.confirmation = false
      this.txBuilder = null
      this.addressPath = []
      this.amountType = this.$store.state.fiatCurrency
      this.receiver_message = ''
    },
    complete () {
      this.success = false
      this.$globalEvent.$emit('do-update-wallet-info')
    },
    deleteButtonPushed () {
      this.clear()
    },
    cameraButtonPushed () {
      this.paused = true
      if (this.show_camera) {
        this.$globalEvent.$emit('camera-finished')
      }
      this.show_camera = !this.show_camera
    },
    onCameraInitError (error) {
      this.show_camera = false
      this.camera_error = true
      this.error_detail = error.message
      console.error(error)
    },
    onCameraDecodeError (error) {
      this.show_camera = false
      this.camera_error = true
      this.error_detail = error.message
      this.$store.commit('setURI', null)
      console.error(error)
    },
    onLoadQRCodeImageError (error) {
      this.show_camera = false
      this.$globalEvent.$emit('open-error-dialog', this.$t('common.invalid_image'))
      this.$store.commit('setURI', null)
      console.error(error)
    },
    onCameraFinish (data) {
      this.show_camera = false
      this.$store.commit('setURI', data)
      if (this.$store.state.uri) {
        this.waitSetURI()
      }
    },
    toFiat (amount) {
      let fiat = amount.multipliedBy(this.fiatRate)
      let ret = '0'
      if (fiat.toString() !== 'NaN') {
        ret = fiat.toString()
      }
      return ret
    },
    toAmount (fiat) {
      let amount = fiat.dividedBy(this.fiatRate)
      let ret = '0'
      if (amount.toString() !== 'NaN') {
        ret = amount.dp(8).toString()
      }
      return ret
    },
    updateFiatRate () {
      utils.getTicker(this.amountType).then(resp => {
        let quote = resp.data.quotes[this.amountType]
        if (quote === null) {
          this.$globalEvent.$emit('open-error-dialog', this.$t('common.currency_is_not_supported', {amountType: this.amountType}))
        } else {
          this.fiatRate = new BigNumber(quote.price)
          if (this.focused === 'fiat') {
            this.amount = this.toAmount(new BigNumber(this.fiat))
          } else {
            this.fiat = this.toFiat(new BigNumber(this.amount))
          }
        }
      }).catch(e => {
        this.$globalEvent.$emit('open-error-dialog', {
          detail: this.$t('send.error.update_fiat_rate_failed'),
          callback: () => {
            setTimeout(this.updateFiatRate, 500)
          }
        })
      })
    }
  },
  watch: {
    amount () {
      if (this.focused !== 'amount') {
        return
      }
      if (!this.checkValidNumber(this.amount, 8)) {
        this.fiat = '0'
      } else {
        this.fiat = this.toFiat(new BigNumber(this.amount))
      }
    },
    fiat () {
      if (this.focused !== 'fiat') {
        return
      }
      this.amount = this.toAmount(new BigNumber(this.fiat))
    },
    amountType () {
      this.updateFiatRate()
    },
    '$store.state.uri' () {
      if (this.$store.state.uri) {
        this.waitSetURI()
      }
    }
  }
}
</script>
