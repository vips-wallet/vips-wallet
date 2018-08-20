<template>
  <v-layout row>
    <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
      <v-card>
        <v-layout row wrap justify-center v-if="!loaded">
          <div class="mt-5">
            <v-progress-circular indeterminate :size="50" color="amber"></v-progress-circular>
          </div>
        </v-layout>
        <v-card-title v-if="loaded && txs.length === 0" v-t="'history.not_found'"></v-card-title>
        <v-card-title v-else v-t="{path: 'history.count', args: {total: total}}"></v-card-title>
        <v-list three-line subheader>
          <v-list-tile
            v-for="(tx, i) in txs"
            :key="i"
            active-class="default--text"
            @click="openDetail(i)"
          >
            <v-list-tile-action>
              <v-btn icon>
                <v-icon v-if="tx.sendTx">open_in_browser</v-icon>
                <v-icon v-else>archive</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ tx.parsed_time }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ tx.transferBalance }} VIPS</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-content>
              <v-list-tile-title></v-list-tile-title>
              <v-list-tile-sub-title>{{ tx.display_confirmations }} confirmations</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
        <v-card-actions>
          <v-btn block v-if="loaded && txs.length < total" :loading="more_loading" :disabled="more_loading" color="primary" @click.native="moreLoad()" v-t="'history.more'"></v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-dialog v-model="show_detail" persistent scrollable max-width="500px">
      <v-card>
        <v-card-title v-t="'history.detail'"></v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 600px;" id="txdetail">
          <v-list three-line subheader>
            <v-list-tile>
              <v-list-tile-content @click="copyClipBoard(detail.txid)">
                <v-list-tile-title v-t="'history.txid'"></v-list-tile-title>
                <v-list-tile-sub-title class="scrollable">{{ detail.txid }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.receive'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.parsed_time }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.transfer'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.transferBalance }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.input'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.valueIn }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.output'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.valueOut }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.txfee'"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.fees }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="detail.rate"></v-divider>
            <v-list-tile v-if="detail.rate">
              <v-list-tile-content>
                <v-list-tile-title v-t="{path: 'history.rate', args: {fiat: detail.rate.currency}}"></v-list-tile-title>
                <v-list-tile-sub-title>{{ detail.rate.rate }} {{ detail.rate.currency }}/VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="detail.message"></v-divider>
            <v-list-tile v-if="detail.message">
              <v-list-tile-content>
                <v-list-tile-title v-t="'history.message'"></v-list-tile-title>
                <v-list-tile-sub-title class="wrap">{{ detail.message }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-divider></v-divider>
          <v-list subheader three-line>
            <v-subheader v-t="'history.sender'"></v-subheader>
            <v-list-tile
              v-for="(addr, i) in detail.inAddresses"
              :key="i"
            >
              <v-list-tile-content @click.prevent="notifications = !notifications">
                <v-list-tile-title :class="addr.mine ? 'mineAddr' : ''">{{ addr.address }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ addr.value }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <v-divider></v-divider>
          <v-list subheader three-line>
            <v-subheader v-t="'history.receiver'"></v-subheader>
            <v-list-tile
              v-for="(addr, i) in detail.outAddresses"
              :key="i"
            >
              <v-list-tile-content @click.prevent="notifications = !notifications">
                <v-list-tile-title :class="addr.mine ? 'mineAddr' : ''">{{ addr.address }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ addr.value }} VIPS</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn block color="primary" @click.stop="openExplorer(detail.txid)" v-t="'history.open_explorer'"></v-btn>
        </v-card-actions>
        <v-card-actions>
          <v-btn block color="primary" @click.stop="closeDetail()" v-t="'common.close'"></v-btn>
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
.mineAddr {
  color: #ffc107;
}
.scrollable {
  overflow-x: scroll;
}
.wrap {
  word-break : break-all;
  overflow-wrap: break-word;
}
</style>

<script>
import {BigNumber} from 'bignumber.js'
import moment from 'moment'
import {messageutil} from 'vipstarcoinjs-wallet-core'
import MugenScroll from 'vue-mugen-scroll'

import utils from '@/utils/utils'

export default {
  name: 'WalletHistory',
  components: {
    MugenScroll
  },
  data () {
    return {
      snackbar: false,
      snackbar_timeout: 4000,
      loaded: false,
      more_loading: false,
      txs: [],
      total: 0,
      detail: {},
      show_detail: false,
      updating: false
    }
  },
  mounted () {
    this.$globalEvent.$on('refresh-button-pushed', this.updateHistory)

    this.$globalEvent.$emit('toolbar-button-visible', {
      delete: false,
      refresh: true,
      camera: false,
      back: false
    })
    this.$globalEvent.$emit('toolbar-title', this.$t('history.description'))
    this.updateHistory()
  },
  destroyed () {
    this.$globalEvent.$off('refresh-button-pushed', this.updateHistory)
  },
  methods: {
    updateHistory () {
      if (this.updating) {
        return
      }
      this.loaded = false
      this.updating = true
      this.txs = []
      if (this.$store.state.account) {
        this.$store.state.account.getTXs([], 0, 10).then(data => {
          this.txs = this.txs.concat(data.items.map(this.parseTX))
          this.total = data.totalItems
          this.loaded = true
        }).catch(e => {
          this.$globalEvent.$emit('open-error-dialog', this.$t('home.error.connection_failed'))
        }).finally(() => {
          this.updating = false
        })
      }
    },
    parseTX (tx) {
      let addrs = this.$store.state.account.addresses.reduce((r, addr) => r.concat([addr.external, addr.change]), [])
      let inBalance = new BigNumber(0)
      let outBalance = new BigNumber(0)
      tx.parsed_time = moment.unix(tx.time).format('YYYY/MM/DD HH:mm:ss')
      tx.receiveTx = false
      tx.sendTx = false

      tx.inAddresses = tx.vin.map(vin => {
        return {
          address: vin.addr,
          mine: (addrs.indexOf(vin.addr) > -1),
          value: vin.value
        }
      })
      tx.outAddresses = Array.prototype.concat.apply([], tx.vout.map(vout => {
        if (vout.scriptPubKey && vout.scriptPubKey.addresses) {
          return vout.scriptPubKey.addresses.map(addr => {
            return {
              address: addr,
              mine: (addrs.indexOf(addr) > -1),
              value: vout.value
            }
          })
        }
        return []
      }))

      tx.vin.forEach((vin, i) => {
        tx.vin[i].mineAddr = (addrs.indexOf(vin.addr) > -1)
        if (tx.vin[i].mineAddr) {
          inBalance = inBalance.plus(vin.value)
        }
      })

      tx.vout.forEach((vout, i) => {
        let mine = false
        if (vout.scriptPubKey && vout.scriptPubKey.addresses) {
          vout.scriptPubKey.addresses.forEach(addr => {
            if (addrs.indexOf(addr) > -1) {
              mine = true
              outBalance = outBalance.plus(vout.value)
            }
          })
        }
        tx.vout[i].mineAddr = mine

        if (vout.scriptPubKey.hex && vout.scriptPubKey.hex.substr(0, 2) === '6a') {
          let message = messageutil.decode(vout.scriptPubKey.hex)
          if (this.isRateMessage(message)) {
            tx.rate = this.parseRate(message)
          } else {
            tx.message = message
          }
        }
      })

      tx.inBalance = inBalance.dp(8).toNumber()
      tx.outBalance = outBalance.dp(8).toNumber()
      if (inBalance.toNumber() > 0) {
        tx.transferBalance = outBalance.minus(inBalance).dp(8).toNumber()
        tx.sendTx = true
      } else {
        tx.transferBalance = outBalance.dp(8).toNumber()
        tx.receiveTx = true
      }

      tx.display_confirmations = (tx.confirmations > 10) ? '10+' : tx.confirmations

      return tx
    },
    moreLoad () {
      if (this.total <= this.txs.length) {
        return
      }
      this.more_loading = true
      if (this.$store.state.account) {
        this.$store.state.account.getTXs([], this.txs.length, this.txs.length + 10).then(data => {
          this.txs = this.txs.concat(data.items.map(this.parseTX))
          this.total = data.totalItems
          this.more_loading = false
        }).catch(e => {
          this.$globalEvent.$emit('open-error-dialog', this.$t('home.error.connection_failed'))
          this.more_loading = false
        })
      }
    },
    openDetail (index) {
      this.detail = this.txs[index]
      this.show_detail = true
    },
    closeDetail () {
      document.getElementById('txdetail').scrollTop = 0
      this.show_detail = false
    },
    parseRate (message) {
      let version = message.match(/^(v\d+\.\d+\.\d+)\|RATE/)
      if (!version || !version[1]) {
        return null
      }

      switch (version[1]) {
        case 'v1.0.0':
          return this.parseRateV1(message)
        default:
          return null
      }
    },
    parseRateV1 (message) {
      let sp = message.split('|')
      return {
        rate: new BigNumber(sp[3]).toNumber(),
        currency: sp[2]
      }
    },
    isRateMessage (message) {
      return !!message.match(/^v\d+\.\d+\.\d+\|RATE/)
    },
    copyClipBoard (txid) {
      if (utils.copyClipBoard(txid)) {
        this.snackbar = true
      }
    },
    openExplorer (txid) {
      window.open(`http://explorer.vipstarcoin.jp/tx/${txid}`)
    }
  }
}
</script>
