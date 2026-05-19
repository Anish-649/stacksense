'use strict';

const GENERAL_PATTERNS = [
  {
    pattern: /permission denied/i,
    what: () => `You do not have permission to perform this action`,
    where: () => 'File system / OS',
    why: () => `Your user account lacks the required permissions`,
    fix: () => `Try running with sudo — or fix permissions with: chmod 755 yourfile`,
    type: 'PermissionError'
  },
  {
    pattern: /command not found: (.+)/,
    what: (m) => `Command '${m[1]}' was not found`,
    where: () => 'Terminal',
    why: (m) => `'${m[1]}' is not installed or not in your PATH`,
    fix: (m) => `Install '${m[1]}' or check that it is added to your PATH`,
    type: 'CommandNotFound'
  },
  {
    pattern: /no such file or directory/i,
    what: () => `A file or directory does not exist`,
    where: () => 'File system',
    why: () => `The path you provided does not exist on disk`,
    fix: () => `Check the path is correct and the file exists`,
    type: 'FileNotFound'
  },
  {
    pattern: /address already in use/i,
    what: () => `A port is already being used by another process`,
    where: () => 'Network',
    why: () => `Another application is already running on that port`,
    fix: () => `Kill the process using the port or change your port number`,
    type: 'PortInUse'
  },
  {
    pattern: /out of memory/i,
    what: () => `The system ran out of memory`,
    where: () => 'System',
    why: () => `Your application consumed all available RAM`,
    fix: () => `Restart the process, reduce memory usage, or increase available RAM`,
    type: 'OutOfMemory'
  },
  {
    pattern: /connection refused/i,
    what: () => `Connection to a server was refused`,
    where: () => 'Network',
    why: () => `The server is not running, wrong port, or firewall is blocking the connection`,
    fix: () => `Check the server is running and the host and port are correct`,
    type: 'ConnectionRefused'
  },
  {
    pattern: /timeout/i,
    what: () => `The operation timed out`,
    where: () => 'Network / System',
    why: () => `The server or process did not respond within the allowed time`,
    fix: () => `Check network connection, increase timeout limit, or verify the server is responsive`,
    type: 'Timeout'
  },
];

function matchGeneral(errorText) {
  for (const entry of GENERAL_PATTERNS) {
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

module.exports = { matchGeneral };