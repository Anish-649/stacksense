#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { runCommand } = require('../src/run');
const { getHistory, getPatterns } = require('../src/history');
const chalk = require('chalk');

program
  .name('stacksense')
  .description('Universal AI-powered CLI debugging assistant')
  .version('1.0.0')
  .enablePositionalOptions(true);

program
  .command('run <command> [args...]')
  .description('Run any command and explain errors automatically')
  .allowUnknownOption(true)
  .passThroughOptions(true)
  .action((command, args) => {
    runCommand(command, args);
  });

program
  .command('history')
  .description('Show your last 10 errors')
  .action(() => {
    const errors = getHistory(10);

    if (errors.length === 0) {
      console.log(chalk.gray('\n  No errors recorded yet.\n'));
      return;
    }

    const line = chalk.gray('─'.repeat(60));
    console.log('\n' + line);
    console.log(chalk.bold.white('  Error history'));
    console.log(line);

    errors.forEach((e, i) => {
      const time = new Date(e.timestamp).toLocaleString();
      console.log(
        chalk.gray(`  ${String(i + 1).padStart(2, '0')}  `) +
        chalk.white.bold(e.type) +
        chalk.gray('  ' + e.language) +
        chalk.gray('  ' + time)
      );
      console.log(chalk.gray('      ') + chalk.dim(e.fix));
      console.log('');
    });

    console.log(line + '\n');
  });

program
  .command('patterns')
  .description('Show your most repeated error types')
  .action(() => {
    const patterns = getPatterns();

    if (patterns.length === 0) {
      console.log(chalk.gray('\n  No patterns found yet.\n'));
      return;
    }

    const line = chalk.gray('─'.repeat(60));
    console.log('\n' + line);
    console.log(chalk.bold.white('  Your most common errors'));
    console.log(line);

    patterns.forEach((p) => {
      const last = new Date(p.last_seen).toLocaleString();
      console.log(
        chalk.red(`  ${String(p.count).padStart(2, ' ')}x  `) +
        chalk.white.bold(p.type) +
        chalk.gray('  ' + p.language) +
        chalk.gray('  last seen ' + last)
      );
    });

    console.log(line + '\n');
  });

program
  .command('log')
  .description('Open full error history text file')
  .action(() => {
    const { LOG_PATH } = require('../src/history');
    const fs = require('fs');

    if (!fs.existsSync(LOG_PATH)) {
      console.log(chalk.gray('\n  No history log found yet. Run some commands first.\n'));
      return;
    }

    console.log(chalk.gray(`\n  Log file: ${LOG_PATH}\n`));

    // print last 20 lines of the file
    const content = fs.readFileSync(LOG_PATH, 'utf8');
    const lines = content.split('\n');
    const last = lines.slice(-40).join('\n');
    console.log(last);
  });

program.parse(process.argv);