const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')

function loadSchema (name) {
  const content = fs.readFileSync(path.join('./jsonschema', name)).toString()
  return JSON.parse(content)
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
  'v2-discover-response',
  'v2-endpoint',
  'v2-header',
  'v2-interface-state',
  'v2-message',
  'v2-response-message'
].forEach(name => {
  try {
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
        throw new Error(`ValidationError ${it}: ` +
          ajv.errorsText() +
          '\nbut got: ' + JSON.stringify(data, null, 2))
      }
    })
  }
}
