<template>
  <v-layout>
    <v-flex xs10 sm8 offset-sm2 offset-xs1>
      <v-layout row class="mt-3">
        <v-flex xs10 sm8 offset-sm2 offset-xs1>
          <v-card>
            <v-card-title>
              <div>
                <h2 v-t="'initialize.your_passphrase'"></h2>
                <p v-t="'initialize.your_passphrase_description'"></p>
                <v-text-field
                  v-model="password"
                  :append-icon="password_visible ? 'visibility' : 'visibility_off'"
                  @click:append="() => (password_visible = !password_visible)"
                  :rules="[
                    () => {return this.password.length < 8 ? $t('initialize.password_less_length') : true}
                  ]"
                  :type="password_visible ? 'text' : 'password'"
                  :label="$t('initialize.password')"
                  counter
                ></v-text-field>
              </div>
            </v-card-title>
            <v-card-actions>
              <v-btn block :disabled="password.length < 8" @click="showMnemonic" v-t="'initialize.show_passphrase'"></v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-flex>
    <v-footer fixed height="auto">
      <v-flex xs12 sm8 offset-sm2>
        <v-layout row wrap justify-center>
          <v-btn block @click="$router.push('create')" v-t="'common.back'"></v-btn>
          <v-btn block :disabled="!complete" @click.native="finish" v-t="'common.finish'"></v-btn>
        </v-layout>
      </v-flex>
    </v-footer>
  </v-layout>
</template>

<style scoped>
.checked {
  text-decoration: line-through;
}
</style>

<script>

export default {
  data () {
    return {
      check: [],
      password: '',
      password_visible: false,
      phrases: [],
      show_passphrase: false
    }
  },
  name: 'Backup',
  mounted: function () {
  },
  computed: {
    complete: function () {
      return this.check.every(c => c === true)
    }
  },
  methods: {
    showMnemonic: function () {
      try {
        this.phrases = this.$store.state.walletGroup.toMnemonic(this.password).split(' ')
        this.check = this.phrases.map((phrase, i) => false)
        console.log(this.check)
        this.show_passphrase = true
      } catch (e) {
        console.error(e)
      }
    },
    finish: function () {
      localStorage.setItem('wallets', this.$store.state.walletGroup.stringify())
      this.$router.push('/wallet/home')
    }
  }
}
</script>
