const request = require('request-promise-native');
const _ = require('lodash');

const PATTERN = /^((fixup! |squash! )?(\w+)(?:\(([^\)\s]+)\))?: (.+))(?:\n|$)/;

const contributionTypeConfig = {
  code: ['feat', 'fix'],
  docs: ['docs'],
  test: ['test'],
};

class Handler {

  static parseCommitMessage(message) {
    const match = PATTERN.exec(message);
    if (!match) {
      return null;
    }
    const type = match[3];
    return _.chain(contributionTypeConfig)
      .toPairs()
      .filter(([, types]) => _.includes(types, type))
      .map(([contribution]) => contribution)
      .first()
      .value();
  }

  static getContributions(commits) {
    return _.chain(commits)
      .map((commit) => commit.commit.message)
      .map((message) => Handler.parseCommitMessage(message))
      .compact()
      .value();
  }

  static getCommits(commitsUrl) {
    return request({
      uri: commitsUrl,
      headers: {
        'User-Agent': 'all-contributors-bot',
      },
      json: true,
    });
  }

  static isPullRequestEvent(requestHeaders) {
    return requestHeaders['x-github-event'] === 'pull_request';
  }

  static isPullRequestMerged(event) {
    return event.action === 'closed' && event.pull_request.merged;
  }

  static handlePullRequest(event) {
    return new Promise((resolve, reject) => {
      if (!Handler.isPullRequestMerged(event)) {
        reject({
          message: 'not a merge pull request',
        });
      }

      Handler.getCommits(event.pull_request.commits_url)
        .then((commits) => {
          resolve({
            login: event.pull_request.user.login,
            contributions: Handler.getContributions(commits),
          });
        });
    });
  }
}

module.exports = Handler;
