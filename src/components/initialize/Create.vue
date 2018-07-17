<template>
  <v-layout>
    <v-flex xs12 sm8 offset-sm2>
      <v-toolbar tabs>
        <v-btn icon @click.native="$router.push('start')">
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <v-toolbar-title v-t="'initialize.create_new_wallet'"></v-toolbar-title>
      </v-toolbar>
      <v-card flat>
        <v-flex xs10 sm8 offset-sm2 offset-xs1>
          <v-layout row>
            <v-flex xs10 sm8 offset-sm2 offset-xs1>
              <v-card flat>
                <v-card-title v-t="'initialize.password'"></v-card-title>
                <v-card-text v-t="'initialize.password_description'"></v-card-text>
                <v-card flat>
                  <v-text-field
                    v-model="password"
                    :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                    @click:append="() => (password_visible = !password_visible)"
                    :rules="[
                      () => {return this.password.length < 8 ? $t('initialize.password_less_length') : true},
                      () => {return this.password.match(/^[a-zA-Z0-9!@#$%^&*]+$/) ? true : $t('initialize.password_use_invalid_word')}
                    ]"
                    :type="password_visible ? 'text' : 'password'"
                    :label="$t('initialize.password')"
                    maxlength=25
                    counter
                  ></v-text-field>
                </v-card>
              </v-card>
            </v-flex>
          </v-layout>
          <v-layout row class="mt-3">
            <v-flex xs10 sm8 offset-sm2 offset-xs1>
              <v-card flat>
                <v-card-title v-t="'initialize.word_count'"></v-card-title>
                <v-card-text v-t="'initialize.word_count_description'"></v-card-text>
                <v-card flat>
                  <p>
                    <v-select
                      cache-items
                      single-line
                      bottom
                      :label="$t('initialize.word_count')"
                      v-model="bits"
                      :items="items"
                    ></v-select>
                  </p>
                </v-card>
              </v-card>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-card>
    </v-flex>
    <v-footer fixed height="auto">
      <v-flex xs12 sm8 offset-sm2>
        <v-layout row wrap justify-center>
          <v-btn block :loading="generating" :disabled="!complete" @click.native="generate" color="primary" v-t="'common.next'"></v-btn>
        </v-layout>
      </v-flex>
    </v-footer>
  </v-layout>
</template>

<style scoped>
.card__title {
  font-weight: bold;
}
</style>

<script>
import bip39 from 'bip39'
import utils from '@/utils/utils'

export default {
  name: 'Create',
  data () {
    return {
      bits: 128,
      password: '',
      password_visible: false,
      generating: false,
      generated_mnemonic: null,
      percentage: 0,
      items: [
        { text: '12', value: 128 },
        { text: '15', value: 160 },
        { text: '18', value: 192 },
        { text: '21', value: 224 },
        { text: '24', value: 256 }
      ]
    }
  },
  mounted: function () {
  },
  computed: {
    mnemonic: function () {
      return bip39.generateMnemonic(this.bits)
    },
    complete: {
      get () {
        return (this.password.length >= 8 && this.password.match(/^[a-zA-Z0-9!@#$%^&*]+$/) && !this.generating)
      }
    }
  },
  methods: {
    generate () {
      this.generating = true
      utils.wait().then(() => {
        return this.$store.dispatch('importMnemonic', {
          mnemonic: this.mnemonic,
          password: this.password
        })
      }).then(() => {
        this.generating = false
        this.$router.push('backup')
      }).catch(error => {
        console.error(error)
        this.$globalEvent.$emit('open-error-dialog', error.message)
      })
    }
  }
}
</script>
