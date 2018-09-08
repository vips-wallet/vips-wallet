import Vue from 'vue'
import Router from 'vue-router'
import App from '@/App'
import Initialize from '@/components/Initialize'
import InitializeStart from '@/components/initialize/Start'
import InitializeBackup from '@/components/initialize/Backup'
import InitializeCreate from '@/components/initialize/Create'
import InitializeRestore from '@/components/initialize/Restore'
import Wallet from '@/components/Wallet'
import WalletHome from '@/components/wallet/Home'
import WalletReceive from '@/components/wallet/Receive'
import WalletSend from '@/components/wallet/Send'
import WalletSign from '@/components/wallet/Sign'
import WalletHistory from '@/components/wallet/History'
import WalletSettings from '@/components/wallet/Settings'
import WalletSettingsLocale from '@/components/wallet/settings/Locale'
import WalletSettingsCurrency from '@/components/wallet/settings/Currency'
import WalletSettingsFingerprint from '@/components/wallet/settings/Fingerprint'
import WalletSettingsBackup from '@/components/wallet/settings/Backup'
import WalletSettingsDelete from '@/components/wallet/settings/Delete'
import WalletSettingsAbout from '@/components/wallet/settings/About'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: App
    },
    {
      path: '/initialize',
      component: Initialize,
      children: [
        {
          path: 'start',
          component: InitializeStart
        },
        {
          path: 'create',
          component: InitializeCreate
        },
        {
          path: 'restore',
          component: InitializeRestore
        },
        {
          path: 'backup',
          component: InitializeBackup
        }
      ]
    },
    {
      path: '/wallet',
      component: Wallet,
      children: [
        {
          path: 'home',
          component: WalletHome
        },
        {
          path: 'receive',
          component: WalletReceive
        },
        {
          path: 'send',
          component: WalletSend
        },
        {
          path: 'sign',
          component: WalletSign
        },
        {
          path: 'history',
          component: WalletHistory
        },
        {
          path: 'settings',
          component: WalletSettings
        },
        {
          path: 'settings/locale',
          component: WalletSettingsLocale
        },
        {
          path: 'settings/currency',
          component: WalletSettingsCurrency
        },
        {
          path: 'settings/fingerprint',
          component: WalletSettingsFingerprint
        },
        {
          path: 'settings/backup',
          component: WalletSettingsBackup
        },
        {
          path: 'settings/delete',
          component: WalletSettingsDelete
        },
        {
          path: 'settings/about',
          component: WalletSettingsAbout
        }
      ]
    }
  ]
})
