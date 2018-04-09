class CustomError extends Error {}

class ProtocolError extends CustomError {
  constructor (name, message, rawResponse) {
    name = name == null ? '<no name>' : name
    message = message == null ? '<no message>' : message
    super('Skill 返回了一个错误: ' + message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProtocolError)
    }

    this.name = name
    this.rawResponse = rawResponse
  }
}

module.exports = { CustomError, ProtocolError }
