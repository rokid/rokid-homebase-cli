const urllib = require('urllib')

module.exports = async function (endpoint, data) {
  const response = await urllib.request(endpoint, {
    method: 'POST',
    contentType: 'json',
    data,
    dataType: 'json'
  })
  if (response.status === 200) {
    return response.data
  }
  throw new Error('status code error: got status ' + response.status)
}
