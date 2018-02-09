const isInstalled = require('./is-installed')
const cleanList = require('./clean-list')

console.log('BABEL PRESET 2')
console.log(require('babel-plugin-codegen'))

module.exports = {
  'presets': cleanList([
    ['env', {
      'debug': false,
      'targets': {
        'node': '6.0.0',
        'browsers': [
          '> 1%',
          'last 4 versions',
          'Firefox ESR',
          'Safari >= 6',
          'iOS >= 7',
          'not ie < 11'
        ]
      }
    }],
    'babel-preset-react',
    'babel-preset-flow'
  ]),
  'plugins': [
    require('babel-plugin-codegen'),
    [require('babel-plugin-transform-decorators-legacy').default],
    require('babel-plugin-transform-async-generator-functions'),
    require('babel-plugin-transform-class-properties'),
    require('babel-plugin-transform-object-rest-spread'),
    require('babel-plugin-transform-runtime'),
    require('babel-plugin-syntax-dynamic-import'),
    require('babel-plugin-transform-export-extensions'),
    [require('babel-plugin-transform-react-remove-prop-types').default, {
      mode: 'wrap'
    }]
  ],
  'env': {
    'development': {
      'plugins': cleanList([
        isInstalled(['preact', 'react'], 'react-hot-loader/babel')
      ])
    }
  }
}
