'use strict';

const { spawn } = require('child_process');
const { explainError } = require('./explain');
const { formatOutput } = require('./formatter');

async function runCommand(command, args) {
  let stderrOutput = '';
  let stdoutOutput = '';

  const child = spawn(command, args, {
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: true
  });

  // capture stderr
  child.stderr.on('data', (data) => {
    const text = data.toString();
    stderrOutput += text;
    process.stderr.write(text); // still show original error
  });

  // capture stdout
  child.stdout && child.stdout.on('data', (data) => {
    stdoutOutput += data.toString();
  });

  child.on('close', async (exitCode) => {
    // command succeeded, do nothing
    if (exitCode === 0) return;

    // command failed, explain the error
    if (stderrOutput.trim()) {
      console.log('\n');
      const explanation = await explainError(stderrOutput);
      formatOutput(explanation);
    } else {
      console.log('\nCommand failed but no error output was captured.');
    }
  });

  child.on('error', (err) => {
    console.error(`\nStackSense: Could not run command "${command}"`);
    console.error(`Reason: ${err.message}`);
  });
}

module.exports = { runCommand };