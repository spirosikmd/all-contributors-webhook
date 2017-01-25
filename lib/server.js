const express = require('express');
const bodyParser = require('body-parser');
const Handler = require('./handler');
const GithubService = require('./services/github-service');
const fs = require('fs');
const spawn = require('child_process').spawn;
const winston = require('winston');

const server = express();

server.use(bodyParser.json());

server.set('port', (process.env.PORT || 4567));

server.post('/payload', function(req, res) {
  if (!Handler.isPullRequestEvent(req.headers)) {
    res.json({
      message: 'not a pull request event'
    });
    return;
  }

  const event = req.body;

  Handler.handlePullRequest(event)
    .then(({login, contributions}) => {
      const {owner, name} = event.repository;

      const githubService = new GithubService({
        repoOwner: owner.login,
        repoName: name
      });

      Promise.all([
        githubService.getReadmeContent()
          .then((content) => {
            fs.writeFileSync('./tmp/README.md', content);
          }),
        githubService.getFileContent({path: '.all-contributorsrc'})
          .then((content) => {
            fs.writeFileSync('./tmp/.all-contributorsrc', content);
          })
      ])
        .then(() => {
          const allContributors = spawn('all-contributors', ['add', `${login}`, `${contributions.join(',')}`], {
            cwd: './tmp'
          });

          allContributors.stdout.on('data', (data) => {
            winston.log('info', `stdout: ${data}`);
          });

          allContributors.stderr.on('data', (data) => {
            winston.log('error', `stderr: ${data}`);
          });

          allContributors.on('close', (code) => {
            winston.log('info', `child process exited with code ${code}`);
          });
        });

      // TODO: create a PR with any changes

      res.json({login, contributions});
    })
    .catch((error) => {
      res.json(error);
    });
});

module.exports = server;
