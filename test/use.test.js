const assert = require('assert')
const db = require('../lib/db')
const use = require('../command/session-use')

describe('use', function () {
  beforeEach(function () {
    const ses = {
      name: 'demo',
      endpoint: 'http://127.0.0.1:3000',
      useAuth: {
        userId: '123',
        userToken: '123'
      }
    }
    db.get('sessions')
      .push(ses)
      .write()

    db.set('currentSession', 'test')
      .write()
  })

  it('should not changed if name is not existed', function (done) {
    use('not-existed-name')
    const currentSessionName = db.get('currentSession').value()
    assert(currentSessionName === 'test')
    done()
  })

  it('currentSessionName should be changed to name', function (done) {
    use('demo')
    const currentSessionName = db.get('currentSession').value()
    assert(currentSessionName === 'demo')
    done()
  })
})
