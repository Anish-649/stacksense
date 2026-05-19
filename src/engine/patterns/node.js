'use strict';

const NODE_PATTERNS = [
  {
    pattern: /Cannot find module '(.+)'/,
    what: (m) => `Node cannot find the module '${m[1]}'`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `'${m[1]}' is either not installed or the path is wrong`,
    fix: (m) => m[1].startsWith('.') 
      ? `Check the file path '${m[1]}' is correct and the file exists`
      : `Run: npm install ${m[1]}`,
    type: 'ModuleNotFoundError'
  },
  {
    pattern: /ReferenceError: (.+) is not defined/,
    what: (m) => `'${m[1]}' is used but never defined`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `You are trying to use '${m[1]}' before declaring it, or it is out of scope`,
    fix: (m) => `Declare '${m[1]}' with const, let, or var before using it`,
    type: 'ReferenceError'
  },
  {
    pattern: /TypeError: (.+) is not a function/,
    what: (m) => `'${m[1]}' is being called as a function but it is not one`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `'${m[1]}' might be undefined, null, or a different type than expected`,
    fix: () => `Check the variable type with console.log(typeof yourVariable) before calling it`,
    type: 'TypeError'
  },
  {
    pattern: /TypeError: Cannot read propert(?:y|ies) of (undefined|null)/,
    what: (m) => `You tried to access a property on ${m[1]}`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `The variable is ${m[1]} at the time you accessed it`,
    fix: () => `Add a null check before accessing: if (variable) { variable.property }`,
    type: 'TypeError'
  },
  {
    pattern: /SyntaxError: Unexpected token '?(.+)'?/,
    what: (m) => `Unexpected token '${m[1]}' found`,
    where: (m, raw) => extractLine(raw),
    why: () => `Node cannot parse your JavaScript — likely a missing bracket, comma, or quote`,
    fix: () => `Check for missing or extra brackets, commas, or quotes near the line shown`,
    type: 'SyntaxError'
  },
  {
    pattern: /ENOENT: no such file or directory, open '(.+)'/,
    what: (m) => `File '${m[1]}' does not exist`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `Node tried to open '${m[1]}' but the file was not found`,
    fix: (m) => `Check that '${m[1]}' exists and the path is correct`,
    type: 'FileNotFoundError'
  },
  {
    pattern: /EADDRINUSE: address already in use :::?(\d+)/,
    what: (m) => `Port ${m[1]} is already being used by another process`,
    where: () => 'Server startup',
    why: (m) => `Another process is already running on port ${m[1]}`,
    fix: (m) => `Run: npx kill-port ${m[1]} — or change your PORT in .env`,
    type: 'PortError'
  },
  {
    pattern: /EACCES: permission denied, (.+)/,
    what: (m) => `Permission denied when accessing '${m[1]}'`,
    where: () => 'File system',
    why: () => `Your user does not have permission to access that file or directory`,
    fix: () => `Run with sudo, or fix permissions with: chmod 755 yourfile`,
    type: 'PermissionError'
  },
  {
    pattern: /UnhandledPromiseRejection.*: (.+)/,
    what: (m) => `A Promise was rejected and not caught — ${m[1]}`,
    where: (m, raw) => extractLine(raw),
    why: () => `An async function threw an error but there was no try/catch or .catch() handler`,
    fix: () => `Wrap your async code in try/catch or add .catch() to the Promise chain`,
    type: 'UnhandledPromiseRejection'
  },
  {
    pattern: /npm ERR! code (.+)/,
    what: (m) => `npm failed with error code ${m[1]}`,
    where: () => 'npm',
    why: () => `npm encountered an error during install or script execution`,
    fix: () => `Try: rm -rf node_modules && npm install — or check npm-debug.log for details`,
    type: 'npmError'
  },
  {
    pattern: /RangeError: Maximum call stack size exceeded/,
    what: () => `Infinite recursion — function called itself too many times`,
    where: (m, raw) => extractLine(raw),
    why: () => `A function keeps calling itself with no exit condition`,
    fix: () => `Add a base case that stops the recursive calls`,
    type: 'RangeError'
  },
];

function extractLine(raw) {
  const match = raw.match(/at .+\((.+):(\d+):\d+\)/);
  if (match) return `${match[1]} line ${match[2]}`;
  return 'Check the stack trace above';
}

function matchNode(errorText) {
  for (const entry of NODE_PATTERNS) {
    const match = errorText.match(entry.pattern);
    if (match) {
      return {
        what: entry.what(match, errorText),
        where: entry.where(match, errorText),
        why: entry.why(match, errorText),
        fix: entry.fix(match, errorText),
        type: entry.type,
        source: 'pattern-engine'
      };
    }
  }
  return null;
}

module.exports = { matchNode };