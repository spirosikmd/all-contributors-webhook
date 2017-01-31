const GithubService = require('../../lib/services/github-service');

describe('GithubService', function() {

  beforeEach(function() {
    this.githubService = new GithubService({
      repoOwner: 'owner',
      repoName: 'name',
    });
  });

  describe('getDefaultConfig', function() {
    it('returns the default config with repo owner and name', function() {
      const config = this.githubService.getDefaultConfig();
      expect(config.owner).toBe('owner');
      expect(config.repo).toBe('name');
    });
  });
});
