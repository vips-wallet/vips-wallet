const constants = {
  BIP21URN: 'vipstarcoin',
  NETWORK: 'mainnet',
  COIN_TYPE: 1919,
  IV: '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f',
  DUST_RELAY_TX_FEE: 0.004,
  TICKER: {
    ID: 2688,
    URL: 'https://api.coinmarketcap.com/v2/ticker/'
  },
  CMC_URL: 'https://coinmarketcap.com/currencies/vipstar-coin/',
  CURRENCIES: [
    'AUD', 'BRL', 'CAD', 'CHF', 'CLP',
    'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
    'HKD', 'HUF', 'IDR', 'ILS', 'INR',
    'JPY', 'KRW', 'MXN', 'MYR', 'NOK',
    'NZD', 'PHP', 'PKR', 'PLN', 'RUB',
    'SEK', 'SGD', 'THB', 'TRY', 'TWD',
    'USD', 'ZAR'
  ],
  QRCODE_CAMERA_CONFIG: {
    audio: false,
    video: {
      facingMode: { ideal: 'environment' },
      width: { min: 360, ideal: 680, max: 1920 },
      height: { min: 240, ideal: 480, max: 1080 },
      frameRate: { min: 10, ideal: 25 }
    }
  },
  BIGNUMBER_FORMATS: {
    PLAIN: {
      decimalSeparator: '.',
      groupSeparator: '',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: ' ',
      fractionGroupSize: 0
    },
    COMMA: {
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: ' ',
      fractionGroupSize: 0
    },
    SPACE: {
      decimalSeparator: '.',
      groupSeparator: ' ',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSeparator: ' ',
      fractionGroupSize: 0
    }
  }
}

export default constants
