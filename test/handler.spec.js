const Handler = require('../lib/handler');

describe('handlers', function() {
  beforeEach(function() {
    this.commits = [{
      commit: {
        message: 'test(readme): test',
      },
    }, {
      commit: {
        message: 'feat(readme): test',
      },
    }, {
      commit: {
        message: 'docs: test',
      },
    }];
  });

  describe('handlePullRequest', function() {
    beforeEach(function() {
      this.event = {
        action: 'closed',
        number: 1,
        pull_request: {
          state: 'closed',
          user: {
            login: 'foo',
          },
          merged: true,
          commits_url: 'url',
        },
      };
      spyOn(Handler, 'getCommits').and.returnValue(Promise.resolve(this.commits));
      spyOn(Handler, 'getContributions').and.returnValue(['code']);
    });

    it('returns the data to pass to contributors if action is closed and merged true', function(done) {
      Handler.handlePullRequest(this.event)
        .then((data) => {
          expect(data).toEqual({
            login: 'foo',
            contributions: ['code'],
          });
          expect(Handler.getCommits).toHaveBeenCalledWith('url');
          done();
        })
        .catch(done.fail)
    });

    it('returns undefined if action is closed but merged is false', function(done) {
      this.event.pull_request.merged = false;
      Handler.handlePullRequest(this.event)
        .then(done.fail)
        .catch(done);
    });
  });

  describe('getContributions', function() {
    it('returns contributions list that contains code for given commits of feat', function() {
      const contributions = Handler.getContributions(this.commits);
      expect(contributions).toEqual(['test', 'code', 'docs']);
    });

    it('returns empty array if parse commit message fails', function() {
      spyOn(Handler, 'parseCommitMessage').and.returnValue(null);
      const contributions = Handler.getContributions(this.commits);
      expect(contributions).toEqual([]);
    });

    it('returns empty array if commits is empty array', function() {
      const contributions = Handler.getContributions([]);
      expect(contributions).toEqual([]);
    });

    it('parses and returns only valid commits', function() {
      const commits = [{
        commit: {
          message: 'test(readme): test',
        },
      }, {
        commit: {},
      }];
      const contributions = Handler.getContributions(commits);
      expect(contributions).toEqual(['test']);
    });
  });

  describe('parseCommitMessage', function() {
    it('returns "code" for commit message of type "feat"', function() {
      const commitMessage = 'feat(config): config through rc file, has precedence over package.json';
      const contribution = Handler.parseCommitMessage(commitMessage);
      expect(contribution).toBe('code');
    });

    it('returns null if message does not match', function() {
      const contribution = Handler.parseCommitMessage('foo');
      expect(contribution).toBe(null);
    });
  });

  describe('isPullRequestEvent', function() {
    it('returns false if the github event header is not pull request', function() {
      expect(Handler.isPullRequestEvent({
        'x-github-event': 'commit',
      })).toBe(false);
    });

    it('returns false if github event header is not present', function() {
      expect(Handler.isPullRequestEvent({})).toBe(false);
    });

    it('returns true if github event header is pull_request', function() {
      expect(Handler.isPullRequestEvent({
        'x-github-event': 'pull_request',
      })).toBe(true);
    });
  });
});
