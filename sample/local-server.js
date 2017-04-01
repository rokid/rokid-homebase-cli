const env = {
  deviceId: 'rokid/no_sn'
};
const lifesmart = require('/Users/HZX/rokid/work/local-driver-lifesmart/index')(env);

const express = require('express');
const app = new express();

app.use(require('body-parser').json());
app.post('/list', function(req, res) {
  lifesmart.list(req.body)
    .then(body => res.send({
      status: 0,
      data: body
    }))
});

app.post('/get', function(req, res) {
  res.send()
});

app.post('/execute', function(req, res) {
  // console.log(req.body);
  lifesmart.execute(req.body.device, req.body.action)
    .then(body => res.send({
      status: 0,
      data: body
    }))
});

app.listen(3001);