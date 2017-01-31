const GitHubApi = require('github');
const _ = require('lodash');

class GithubService {

  constructor(options = {}) {
    this.github = new GitHubApi({
      debug: true,
      version: '3.0.0',
      headers: {
        'user-agent': 'all-contributors-webhook',
      },
    });
    this.repoOwner = options.repoOwner;
    this.repoName = options.repoName;
  }

  getDefaultConfig() {
    return {
      owner: this.repoOwner,
      repo: this.repoName,
    };
  }

  createPullRequest({head, base, login}) {
    return this.github.pullRequests.create(_.merge(this.getDefaultConfig(), {
      title: `chore(contribution): update contribution for ${login}`,
      head,
      base,
    }));
  }
}

module.exports = GithubService;
