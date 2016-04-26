/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var app = express();

var PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || 'no-access-token-in-env';

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

app.use(bodyParser.json({
    verify: function(req, res, buf, encoding) {
      // sha1 content
      // var hash = crypto.createHash('sha1');
      // hash.update(buf);
      // req.hasha = hash.digest('hex');
      // console.log("hash", req.hasha);

      // get rawBody
      req.rawBody = buf.toString();
      console.log("rawBody [" + req.rawBody + "]");
      console.log("x-hub-signature [" + req.headers["x-hub-signature"] + "]");
    }
}));

app.get('/', function(req, res) {
  console.log(req);
  res.send('It works!');
});

app.get(['/facebook', '/instagram'], function(req, res) {
  if (
    req.param('hub.mode') == 'subscribe' &&
    req.param('hub.verify_token') == 'token'
  ) {
    res.send(req.param('hub.challenge'));
  } else {
    res.sendStatus(400);
  }
});

app.post('/facebook', function(req, res) {
  console.log('Facebook request body:');
  console.log(req.body);
  console.log('> messaging object:');
  console.log(req.body.entry[0].messaging);
  // Process the Facebook updates here
  res.sendStatus(200);

  var messaging = req.body.entry[0].messaging[0];
  if (messaging.message) {
    var userId = messaging.sender.id;
    var message = messaging.message.text;
    request({
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + PAGE_ACCESS_TOKEN,
      method: "POST",
      json: {
        "recipient":{
          "id": userId
        },
        "message":{
          "text":"You said '" + message + "'."
        }
      }
    }, function(error, response, body) {
      console.log('Send message returned HTTP ', response.statusCode);
      if (response.statusCode != 200) {
        console.log('> ', body);
      }
    });
  }
});

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();
