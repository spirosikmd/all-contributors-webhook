const GithubService = require('../../lib/services/github-service');

describe('GithubService', function() {

  beforeEach(function() {
    this.githubService = new GithubService({
      repoOwner: 'owner',
      repoName: 'name'
    });
  });

  describe('getReadmeContent', function() {
    it('resolves with readme contents', function(done) {
      const data = {
        content: 'readme data'
      };
      spyOn(this.githubService, 'atob').and.returnValue(data.content);
      spyOn(this.githubService.github.repos, 'getReadme').and.returnValue(Promise.resolve(data));
      this.githubService.getReadmeContent()
        .then((content) => {
          expect(this.githubService.github.repos.getReadme).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'name'
          });
          expect(content).toBe(data.content);
          expect(this.githubService.atob).toHaveBeenCalledWith(data.content);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getFileContent', function() {
    it('resolves with file contents', function(done) {
      const data = {
        content: 'file data'
      };
      const path = 'file';
      spyOn(this.githubService, 'atob').and.returnValue(data.content);
      spyOn(this.githubService.github.repos, 'getContent').and.returnValue(Promise.resolve(data));
      this.githubService.getFileContent({path})
        .then((content) => {
          expect(this.githubService.github.repos.getContent).toHaveBeenCalledWith({
            owner: 'owner',
            repo: 'name',
            path
          });
          expect(content).toBe(data.content);
          expect(this.githubService.atob).toHaveBeenCalledWith(data.content);
          done();
        })
        .catch(done.fail);
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
