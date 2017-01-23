const express = require('express');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());

const Handler = require('./handler');

server.post('/payload', function(req, res) {
  // TODO: find out if this is a pull request event
  const event = req.body;

  Handler.handlePullRequest(event)
    .then(data => {
      // {login: <github-username>, contributions: ['code']}
      // TODO: run "all-contributors add <github-username> contributions" using readme file and rc of target repo
      // TODO: create a PR with any changes
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

module.exports = server;
