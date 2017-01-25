const GitHubApi = require('github');
const atob = require('atob');
const _ = require('lodash');

class GithubService {

  constructor(options = {}) {
    this.github = new GitHubApi({
      version: '3.0.0',
      headers: {
        'user-agent': 'all-contributors-webhook'
      }
    });
    this.atob = atob;
    this.repoOwner = options.repoOwner;
    this.repoName = options.repoName;
  }

  getDefaultConfig() {
    return {
      owner: this.repoOwner,
      repo: this.repoName
    };
  }

  getReadmeContent() {
    return this.github.repos.getReadme(this.getDefaultConfig())
      .then((data) => {
        return this.atob(data.content);
      });
  }

  getFileContent({path}) {
    return this.github.repos.getContent(_.merge(this.getDefaultConfig(), {path}))
      .then((data) => {
        return this.atob(data.content);
      });
  }
}

module.exports = GithubService;
