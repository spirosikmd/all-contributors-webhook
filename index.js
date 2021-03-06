const server = require('./lib/server');
const winston = require('winston');

require('now-logs')(process.env.NOW_LOGS_KEY);

server.listen(server.get('port'), () => {
  winston.log('info', `all-contributors-webhook is running on port ${server.get('port')}`);
});
