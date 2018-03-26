// const rpc = require('json-rpc2');
const jayson = require('jayson')
const url = require('url')

class SSDPDevice {
  /**
   * make a ssdp device
   * @param headers
   * @param headers.DEVICE_TYPE
   * @param headers.USN
   * @param headers.LOCATION
   * @returns {*}
   */
  static getDeviceFromHeader (headers) {
    if (!headers.USN || !headers.DEVICE_TYPE) {
      return null
    }

    return {
      deviceId: headers.USN,
      type: headers.DEVICE_TYPE,
      location: headers.LOCATION,
      headers: headers
    }
  }
  /**
   * @param opts
   * @param opts.deviceId
   * @param opts.type
   * @param opts.LOCATION
   * @param opts.headers
   */
  constructor (opts) {
    this.deviceId = opts.deviceId
    this.type = opts.type
    this.updateLocation(this.location)
    this._headers = opts.headers
    this._connection = null
  }

  updateLocation (location) {
    if (location !== this.location) {
      this.location = location
      if (this._connection) {
        this._connection.close(() => {
          this._connection = this.createConnection()
        })
      }
    }
  }

  createConnection () {
    const location = url.parse(this.location)
    if (location.protocol === 'tcp') {
      return TCPConnection()
    } else {
      throw new Error('not supported')
    }
  }

  close (cb) {
    cb()
  }

  toJSON () {
    return {
      deviceId: this.deviceId,
      type: this.type,
      location: this.location,
      _headers: this._headers
    }
  }
}

module.exports = SSDPDevice

function TCPConnection (options, homebase) {
  const client = jayson.client.tcp({
    port: options.port,
    host: options.hostname
  })

  const callApi = function (name, params) {
    return new Promise(function (resolve, reject) {
      client.call(name, params, (err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
    })
  }

  return callApi('connect', {
    deviceId: homebase.deviceId
  })
    .then(() => ({
      list () {
        return callApi('list')
      },

      execute (device, action) {
        return callApi('execute', {device, action})
      },

      get (device) {
        return callApi('get', { device })
      },

      command (name, params) {
        return callApi('command', { name, params })
      }
    }))
}
