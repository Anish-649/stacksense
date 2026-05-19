'use strict';

const chalk = require('chalk');

function formatOutput(result) {
  const { what, where, why, fix, type, language, source } = result;

  const line = chalk.gray('─'.repeat(60));
  const thinLine = chalk.gray('·'.repeat(60));

  // top separator
  console.log('\n' + line);

  // header line — error type + language
  console.log(
    chalk.bgRed.white.bold(` ${type || 'Error'} `) +
    '  ' +
    chalk.gray(language || 'unknown') +
    '  ' +
    chalk.gray(getEngine(source))
  );

  console.log(thinLine);

  // what
  console.log(chalk.gray('  what  ') + chalk.white.bold(what));

  // where — only show if meaningful
  if (where && where !== 'See error above' && where !== 'Check the traceback above') {
    console.log(chalk.gray('  where ') + chalk.yellow(where));
  }

  // why
  console.log(chalk.gray('  why   ') + chalk.white(why));

  // separator before fix
  console.log(thinLine);

  // fix — most important line, stands out
  console.log(chalk.gray('  fix   ') + chalk.greenBright.bold(fix));

  // bottom separator
  console.log(line + '\n');
}

function getEngine(source) {
  switch (source) {
    case 'pattern-engine': return chalk.dim('local engine');
    case 'history':        return chalk.dim('from history');
    case 'gemini':         return chalk.dim('gemini ai');
    case 'fallback-failed': return chalk.red('analysis failed');
    default:               return chalk.dim('internal');
  }
}

module.exports = { formatOutput };