const winston = require('winston');
const spawn = require('child-process-promise').spawn;

function spawnCommand(command, arguments, options) {
  let promise = spawn(command, arguments, options);
  let childProcess = promise.childProcess;

  childProcess.stdout.on('data', (data) => {
    winston.log('info', `stdout: ${data}`);
  });

  childProcess.stderr.on('data', (data) => {
    winston.log('info', `stderr: ${data}`);
  });

  childProcess.on('close', (code) => {
    winston.log('info', `${command} exited with code ${code}`);
  });

  return promise;
}

module.exports = {
  spawnCommand,
};
