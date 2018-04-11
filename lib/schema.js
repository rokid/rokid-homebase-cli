const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')
const localize = require('ajv-i18n')
const debug = require('debug')('rhome:schema')

function loadSchema (name) {
  const content = fs.readFileSync(path.join('../jsonschema', name)).toString()
  return JSON.parse(content)
}

class ValidationError extends Error {
  constructor (schema, errorsText, actual) {
    super('validation failed on schema: ' + schema)
    this.name = 'ValidationError'
    this.actual = actual
    this.validationText = errorsText
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }
}

const ajv = new Ajv({ allErrors: true, jsonPointers: true })
;[
  'action',
  'actions',
  'api-common-http',
  'api-execute',
  'api-get',
  'api-list',
  'device',
  'state',
  'v2-capability',
  'v2-definitions',
  'v2-discovery-response',
  'v2-endpoint',
  'v2-header',
  'v2-interface-state',
  'v2-message',
  'v2-response-message'
].forEach(name => {
  try {
    debug('loading schema', name)
    ajv.addSchema(loadSchema(name + '.json'), '/' + name)
  } catch (err) {
    console.log(`load schema ${name} failed`)
    throw err
  }
})

module.exports = {
  loadSchema,
  ajv,
  validate (schemas, data) {
    schemas.forEach(it => {
      if (!ajv.validate(it, data)) {
        localize.zh(ajv.errors)
        throw new ValidationError(`${it}`,
          ajv.errorsText(ajv.errors, { separator: '\n' }),
          JSON.stringify(data, null, 2))
      }
    })
  }
}
