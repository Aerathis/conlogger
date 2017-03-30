'use strict'
let express = require('express');
let bodyParser = require('body-parser');
let exec = require('child_process').exec;

if (process.argv.length < 3) {
  console.log("Container name required");
  return
}

var containerName = process.argv[2];

let app = express();

app.use(bodyParser.json());

app.post('/containerlogs', function(req, res) {
  var filterPred = req.body.filterPred;
  if (!filterPred) {
    res.status(400).send("Invalid request");
    return
  }
  exec('docker logs ' + containerName, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      res.status(500).send(error);
    } else {
      // Using stderr because exec returns the streams reversed for some reason
      var cmdResponse = stderr;
      var lines = stderr.split('\n');
      var logResponse = {};
      logResponse[filterPred] = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf(filterPred) > -1) {
          logResponse[filterPred].push(lines[i])
        }
      }
      res.json(logResponse);
    }
  });
});

app.listen(8888);
