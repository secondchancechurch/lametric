require('envc')()

const App = require('./app.js')

const server = require('./server')
const app = new App(server)
app.start()
process.on('SIGINT', () => app.stop())
