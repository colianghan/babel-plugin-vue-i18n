module.exports = {
    appenders: { cheese: { type: 'file', filename: 'i18n/babel.log' } },
    categories: { default: { appenders: ['cheese'], level: 'info' } }
}