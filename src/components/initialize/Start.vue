<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-card-media
        :src="logo"
        height="150px"
        class="mt-5"
        contain
      >
      </v-card-media>
      <v-card-title primary-title>
        <div class="apptitle">
          <h3 class="headline mb-0">{{ $t("message.title") }}</h3>
          <div class="apptitle">{{ $t("message.phrase") }}</div>
          <v-select cache-items
            single-line
            bottom
            :label="$t('common.language')"
            v-model="locale"
            :items="items"
            ></v-select>
        </div>
      </v-card-title>
      <v-flex xs12 sm6 offset-sm3>
        <v-card-actions>
        </v-card-actions>
        <v-card-actions>
        </v-card-actions>
      </v-flex>
    </v-flex>
    <v-footer fixed height="auto">
      <v-flex xs10 sm6 offset-xs1 offset-sm3>
        <v-layout row wrap justify-center>
          <v-btn block color="orange" :disabled="disabled" @click="$router.push('create')">{{ $t("initialize.create") }}</v-btn>
        </v-layout>
        <v-layout row wrap justify-center>
          <v-btn block color="orange" :disabled="disabled" @click="$router.push('restore')">{{ $t("initialize.restore") }}</v-btn>
        </v-layout>
      </v-flex>
    </v-footer>
  </v-layout>
</template>

<style scoped>
div.apptitle {
  margin: 0 auto;
  text-align: center;
}
</style>

<script>
import logo from '@/assets/logo_150x150.png'
import storage from '@/storage'

export default {
  name: 'Start',
  data () {
    return {
      logo: logo,
      items: [
        { text: '日本語', value: 'ja' },
        { text: 'English', value: 'en' },
        { text: 'Deutsch', value: 'de' }
      ]
    }
  },
  mounted () {
    if (window.cordova) {
      document.addEventListener('deviceready', this.onDeviceReady, false)
    }
  },
  computed: {
    locale: {
      get () {
        return this.$i18n.locale
      },
      set (value) {
        storage.setItem('locale', value).then(() => {
          this.$i18n.locale = value
        })
      }
    },
    disabled () {
      return !this.$store.state.agreement
    }
  },
  methods: {
    onDeviceReady () {
      document.addEventListener('backbutton', this.onBackKeyDown, false)
    },
    onBackKeyDown (ev) {
      ev.preventDefault()
      navigator.app.exitApp()
    }
  }
}
</script>
