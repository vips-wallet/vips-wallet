<template>
  <v-app>
    <v-navigation-drawer
      persistent :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher fixed
      app
      v-if="cameraButton"
    >
      <v-list>
          <v-list-tile>
            <v-list-tile-action>
              <v-btn icon>
                <v-icon>account_balance_wallet</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="{path: 'menu.account', args: {name: account_label}}"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        <router-link
          value="true"
          v-for="(item, i) in items"
          :key="i"
          active-class="default--text"
          :to="item.route"
        >
          <v-list-tile @click="">
            <v-list-tile-action>
              <v-btn icon>
                <v-icon v-html="item.icon"></v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-t="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </router-link>
        <v-list-tile @click.stop="toggleVariant()">
          <v-list-tile-action>
            <v-btn icon>
              <v-icon v-html="miniVariantIcon"></v-icon>
            </v-btn>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Minimize</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
    >
      <v-toolbar-side-icon @click.stop="toggleDrawer()" v-if="cameraButton"></v-toolbar-side-icon>
      <v-btn icon @click.stop="backButtonPushed()" v-if="backButtonVisible && cameraButton">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="deleteButtonPushed()" v-if="deleteButtonVisible && cameraButton">
        <v-icon>delete</v-icon>
      </v-btn>
      <v-btn icon @click.stop="refreshWalletInfo()" v-if="refreshButtonVisible && cameraButton">
        <v-icon>refresh</v-icon>
      </v-btn>
      <v-btn icon @click.stop="cameraButtonPushed()" v-if="cameraButtonVisible">
        <v-icon v-if="cameraButton">camera_alt</v-icon>
        <v-icon v-else>clear</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 VIPSTARCOIN</span>
    </v-footer>
    <license-agreement @agree="onAgree()"/>
    <limit-notify v-model="notify"/>
  </v-app>
</template>

<style scoped>
a {
  color: #000000;
  text-decoration: none;
}
</style>

<script>
import LicenseAgreement from '@/components/LicenseAgreement'
import LimitNotify from '@/components/LimitNotify'
import utils from '@/utils/utils'

let minimize = localStorage.getItem('minimize')
minimize = (minimize) ? JSON.parse(minimize) : false

export default {
  name: 'Wallet',
  components: {
    LicenseAgreement,
    LimitNotify
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: minimize,
      miniVariantIcon: minimize ? 'chevron_right' : 'chevron_left',
      deleteButtonVisible: false,
      refreshButtonVisible: false,
      cameraButtonVisible: false,
      backButtonVisible: false,
      account_label: '',
      items: [
        { icon: 'home', title: 'menu.home', route: '/wallet/home' },
        { icon: 'archive', title: 'menu.receive', route: '/wallet/receive' },
        { icon: 'open_in_browser', title: 'menu.send', route: '/wallet/send' },
        { icon: 'history', title: 'menu.history', route: '/wallet/history' },
        { icon: 'settings', title: 'menu.settings', route: '/wallet/settings' }
      ],
      title: '',
      notify: false
    }
  },
  computed: {
    cameraButton: {
      get () {
        return !this.$store.state.useCamera
      },
      set (value) {
        this.$store.commit('setUseCamera', !value)
      }
    }
  },
  mounted () {
    let config = localStorage.getItem('wallets')
    if (!config) {
      this.$router.push('/initialize/start')
    }

    utils.handleOpenURICallback((uri) => {
      try {
        this.$store.commit('setURI', uri)
        this.$router.push('/wallet/send')
      } catch (e) {
        this.$globalEvent.$emit('error-handle-open-uri')
        console.error(e)
      }
    })

    this.$globalEvent.$on('toolbar-button-visible', (opt) => {
      Object.keys(opt).forEach((key) => {
        if (opt[key] !== true && opt[key] !== false) return
        switch (key) {
          case 'delete':
            this.deleteButtonVisible = opt[key]
            break
          case 'refresh':
            this.refreshButtonVisible = opt[key]
            break
          case 'camera':
            this.cameraButton = true
            this.cameraButtonVisible = opt[key]
            break
          case 'back':
            this.backButtonVisible = opt[key]
        }
      })
    })

    this.$globalEvent.$on('camera-finished', () => {
      this.cameraButton = true
    })

    this.$globalEvent.$on('toolbar-title', (title) => {
      this.title = title
    })

    this.$globalEvent.$on('account_label', (label) => {
      this.account_label = label
    })

    this.$store.dispatch('initialize', config).then(() => {
      this.$globalEvent.$emit('wallet-info-updated')
      this.$globalEvent.$emit('account_label', this.$store.state.account.label)
    }).catch(error => {
      this.$globalEvent.$emit('error-update-wallet-info', error)
    })

    this.$globalEvent.$on('do-update-wallet-info', () => {
      this.$globalEvent.$emit('account_label', this.$store.state.account.label)
      this.$store.dispatch('updateInfo').then(() => {
        this.$globalEvent.$emit('wallet-info-updated')
      }).catch(error => {
        this.$globalEvent.$emit('error-update-wallet-info', error)
      })
    })

    if (this.$store.state.agreement) {
      this.notify = true
    }
  },
  methods: {
    toggleDrawer (event) {
      this.drawer = !this.drawer
      return this.drawer
    },
    toggleVariant (event) {
      this.miniVariant = !this.miniVariant
      this.miniVariantIcon = this.miniVariant ? 'chevron_right' : 'chevron_left'
      localStorage.setItem('minimize', this.miniVariant)
      return this.miniVariant
    },
    refreshWalletInfo () {
      this.$globalEvent.$emit('refresh-button-pushed')
      this.$globalEvent.$emit('do-update-wallet-info')
      this.$store.dispatch('updateInfo').then(() => {
        this.$globalEvent.$emit('wallet-info-updated')
      }).catch(error => {
        this.$globalEvent.$emit('error-update-wallet-info', error)
      })
    },
    cameraButtonPushed () {
      this.cameraButton = false
      if (window.cordova) {
        let permissions = window.cordova.plugins.permissions
        permissions.checkPermission(permissions.CAMERA, (stat) => {
          if (stat.hasPermission) {
            this.$globalEvent.$emit('camera-button-pushed')
          } else {
            permissions.requestPermission(permissions.CAMERA, (stat) => {
              if (stat.hasPermission) {
                this.$globalEvent.$emit('camera-button-pushed')
              } else {
                this.$globalEvent.$emit('open-error-dialog', this.$t('common.camera_not_permitted'))
              }
            }, () => {
              this.$globalEvent.$emit('open-error-dialog', this.$t('common.camera_not_permitted'))
            })
          }
        }, null)
      } else {
        this.$globalEvent.$emit('camera-button-pushed')
      }
    },
    deleteButtonPushed () {
      this.$globalEvent.$emit('delete-button-pushed')
    },
    backButtonPushed () {
      this.$globalEvent.$emit('back-button-pushed')
    },
    onAgree () {
      this.notify = true
    }
  },
  watch: {
    '$route' (to, from) {
      this.$globalEvent.$emit('wallet-move-pane', to)
    }
  }
}
</script>
