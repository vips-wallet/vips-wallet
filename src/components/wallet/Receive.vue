<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card v-if="qrcodeDataUri">
        <v-card>
          <div class="qrcode-info">
            <v-card-media
                :src="qrcodeDataUri"
                alt="QRCode"
                height="200px"
                contain
            >
            </v-card-media>
            <v-card-text>{{ address }}</v-card-text>
            <v-card-actions>
              <v-btn block color="primary" dark v-t="'receive.copy'" @click="copyURIClipBoard()"></v-btn>
            </v-card-actions>
          </div>
        </v-card>
        <v-container>
          <v-subheader>{{ $t('receive.setting') }}</v-subheader>
          <v-layout row>
            <v-flex xs12>
              <v-select
                cache-items
                single-line
                bottom
                :label="$t('receive.address')"
                v-model="address"
                :items="addresses"
                ></v-select>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12>
              <v-switch
                :label="$t('receive.use_fiat', {amount_type: useFiat ? amountType : 'VIPS'})"
                v-model="useFiat"
              ></v-switch>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs8>
              <v-text-field
                id="amount"
                name="amount"
                :label="$t('receive.amount')"
                v-model="amount"
                @focus="onAmount"
                :rules="[
                  () => checkValidNumber(amount, 8) || $t('receive.error.invalid_amount'),
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
                :label="$t('receive.fiat')"
                v-model="fiat"
                @focus="onFiat"
                :rules="[
                  () => checkValidNumber(fiat) || $t('receive.error.invalid_fiat')
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
                :label="$t('receive.message')"
                v-model="message"
              ></v-text-field>
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
      {{ $t('common.copy_clipboard') }}
      <v-btn flat @click="snackbar = false" v-t="'common.close'">
      </v-btn>
    </v-snackbar>
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
div.qrcode-info {
  margin: 0 auto;
  text-align: center;
}
</style>

<script>
import {BigNumber} from 'bignumber.js'
import utils from '@/utils/utils'
import CONST from '@/utils/const'

export default {
  name: 'WalletReceive',
  data () {
    return {
      address: null,
      addresses: [],
      qrcodeDataUri: '',
      amount: '0',
      fiat: '0',
      message: '',
      focused: '',
      useFiat: false,
      fiatRate: this.$store.state.price,
      currencies: CONST.CURRENCIES,
      amountType: this.$store.state.fiatCurrency,
      snackbar: false,
      snackbar_timeout: 4000,
      dust: new BigNumber(CONST.DUST_RELAY_TX_FEE)
    }
  },
  mounted () {
    if (this.$store.state.account !== null) {
      this.address = this.$store.state.account.getDefaultReceiveAddress()
      this.addresses = this.$store.state.account.addresses.map(addr => addr.external)
      this.updateQRCode()
    }

    this.$globalEvent.$on('refresh-button-pushed', this.refreshButtonPushed)
    this.$globalEvent.$on('delete-button-pushed', this.deleteButtonPushed)

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: true,
      refresh: true,
      camera: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('receive.description'))
  },
  destroyed () {
    this.$globalEvent.$on('refresh-button-pushed', this.refreshButtonPushed)
    this.$globalEvent.$off('delete-button-pushed', this.deleteButtonPushed)
  },
  methods: {
    refreshButtonPushed () {
      this.updateFiatRate()
    },
    deleteButtonPushed () {
      this.useFiat = false
      this.amountType = this.$store.state.fiatCurrency
      this.amount = '0'
      this.fiat = '0'
      this.message = ''
    },
    updateQRCode () {
      let opt = {}
      if (this.amount !== '0') opt.amount = this.amount
      if (this.message !== '') opt.message = this.message
      if (this.useFiat) {
        opt.amountType = this.amountType
        opt.amountExt = this.fiat
      }
      return utils.getQRCodeDataUri(this.address, opt).then((uri) => {
        return new Promise((resolve, reject) => {
          this.qrcodeDataUri = uri
          resolve()
        })
      })
    },
    copyURIClipBoard () {
      let opt = {}
      if (this.amount !== '0') opt.amount = this.amount
      if (this.message !== '') opt.message = this.message
      if (this.useFiat) {
        opt.amountType = this.amountType
        opt.amountExt = this.fiat
      }
      if (utils.copyClipBoard(utils.encodeURI(this.address, opt))) {
        this.snackbar = true
      }
    },
    checkValidNumber (n, decimals = -1) {
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
    checkDust () {
      return (this.dust.comparedTo(this.amount) < 1 || this.amount === '' || this.amount === '0')
    },
    onAmount () {
      this.focused = 'amount'
    },
    onFiat () {
      this.focused = 'fiat'
    },
    toAmount (fiat) {
      let amount = fiat.dividedBy(this.fiatRate)
      let ret = '0'
      if (amount.toString() !== 'NaN') {
        ret = amount.dp(8).toString()
      }
      return ret
    },
    toFiat (amount) {
      let fiat = amount.multipliedBy(this.fiatRate)
      let ret = '0'
      if (fiat.toString() !== 'NaN') {
        ret = fiat.toString()
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
          if (this.useFiat) {
            this.amount = this.toAmount(new BigNumber(this.fiat))
          } else {
            this.fiat = this.toFiat(new BigNumber(this.amount))
          }
          this.updateQRCode()
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
    address () {
      this.updateQRCode()
    },
    useFiat () {
      this.updateQRCode()
    },
    amount () {
      if (this.focused !== 'amount') {
        return
      }
      this.fiat = this.toFiat(new BigNumber(this.amount))
      this.updateQRCode()
    },
    fiat () {
      if (this.focused !== 'fiat') {
        return
      }
      this.amount = this.toAmount(new BigNumber(this.fiat))
      this.updateQRCode()
    },
    message () {
      this.updateQRCode()
    },
    amountType () {
      this.updateFiatRate()
    }
  }
}
</script>
