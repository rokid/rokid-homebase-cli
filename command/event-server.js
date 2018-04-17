const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const colors = require('colors')
const Session = require('../lib/session')
const { validate } = require('../lib/schema')
const Device = require('../lib/device')
const log = require('../lib/log')

function eventHandler (sessionName) {
  return async function eventHandler (ctx, next) {
    if (ctx.method !== 'POST') {
      ctx.body = 'Expecting a POST request'
      ctx.status = 400
      return
    }
    const body = ctx.request.body
    try {
      validate([ '/v2-change-report' ], body)
    } catch (err) {
      ctx.body = err
      ctx.status = 422
      return
    }
    ctx.status = 202
    const { endpoint, payload: { change: { cause } } } = body
    console.log('Received a change report:', JSON.stringify(body, null, 2))
    console.log('Caused by:', colors.green(cause))
    Device.updateStateById(endpoint.endpointId, sessionName, null, endpoint.states)
    log.listDevice(Device.getBySessionName(sessionName).find(it => it.endpointId === endpoint.endpointId), { states: true })
  }
}

module.exports = function eventServer (options) {
  const currentSessionName = Session.getCurrentSessionName()
  const { port = 0 } = options

  const app = new Koa()
  app.use(bodyParser())
  app.use(eventHandler(currentSessionName))

  const server = app.listen(port, () => {
    console.log(`rhome listening on port ${server.address().port}`)
  })
}
