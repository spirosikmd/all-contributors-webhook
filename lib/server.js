const express = require('express');
const bodyParser = require('body-parser');
const Handler = require('./handler');
const winston = require('winston');
const rimraf = require('rimraf');
const {spawnCommand} = require('./commands');

const server = express();

server.use(bodyParser.json());

server.set('port', (process.env.PORT || 4567));

server.post('/payload', function(req, res) {
  if (!Handler.isPullRequestEvent(req.headers)) {
    res.json({
      message: 'not a pull request event',
    });
    return;
  }

  const event = req.body;

  Handler.handlePullRequest(event)
    .then(({login, contributions}) => {
      // const {owner, name} = event.repository;

      // const githubService = new GithubService({
      //   repoOwner: owner.login,
      //   repoName: name,
      // });

      return spawnCommand('git', ['clone', event.repository.ssh_url], {
        cwd: './tmp',
      })
        .then(() => {
          return spawnCommand('git', ['checkout', '-b', 'update-contributors'], {
            cwd: `./tmp/${event.repository.name}`,
          });
        })
        .then(() => {
          return spawnCommand('../../node_modules/.bin/all-contributors', [
            'add', `${login}`, contributions.join(','), '--commit',
          ], {
            cwd: `./tmp/${event.repository.name}`,
          });
        })
        .then(() => {
          return spawnCommand('git', ['push', 'origin', '-u', 'update-contributors'], {
            cwd: `./tmp/${event.repository.name}`,
          });
        })
        // // .then(() => {
        // //   // TODO: this needs authentication?
        // //   return githubService.createPullRequest({
        // //     head: 'update-contributors',
        // //     base: 'master',
        // //     login: login,
        // //   });
        // // })
        .then(() => {
          winston.log('info', `all done! removing ${event.repository.name}`);
          return new Promise((resolve, reject) => {
            rimraf(`./tmp/${event.repository.name}`, (err) => {
              if (err) {
                reject(err);
              }
              resolve();
            });
          });
        })
        .then(() => {
          res.json({login, contributions});
        })
        .catch((error) => {
          winston.log('info', error);
          res.json(error);
        });
    })
    .catch((error) => {
      res.json(error);
    });
});

module.exports = server;
