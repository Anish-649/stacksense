'use strict';

const LANGUAGE_PATTERNS = [
  {
    language: 'python',
    patterns: [
      /Traceback \(most recent call last\)/,
      /ModuleNotFoundError/,
      /IndentationError/,
      /SyntaxError.*line \d+/,
      /NameError: name '(.+)' is not defined/,
      /TypeError: '(.+)' object/,
      /AttributeError/,
      /KeyError/,
      /IndexError/,
      /ValueError/,
      /FileNotFoundError/,
      /ZeroDivisionError/,
      /ImportError/,
    ]
  },
  {
    language: 'node',
    patterns: [
      /at Object\.<anonymous>/,
      /at Module\._compile/,
      /Cannot find module/,
      /ReferenceError:/,
      /TypeError: .+ is not a function/,
      /UnhandledPromiseRejection/,
      /ENOENT: no such file or directory/,
      /EADDRINUSE/,
      /SyntaxError: Unexpected token/,
      /npm ERR!/,
    ]
  },
  {
    language: 'java',
    patterns: [
      /Exception in thread/,
      /java\.lang\./,
      /NullPointerException/,
      /ArrayIndexOutOfBoundsException/,
      /ClassNotFoundException/,
      /NumberFormatException/,
      /StackOverflowError/,
      /at [a-zA-Z]+\.[a-zA-Z]+\([a-zA-Z]+\.java:\d+\)/,
    ]
  },
  {
    language: 'git',
    patterns: [
      /fatal: /,
      /error: /,
      /CONFLICT/,
      /refusing to merge unrelated histories/,
      /Your branch is behind/,
      /not a git repository/,
      /Permission denied \(publickey\)/,
    ]
  },
  {
    language: 'general',
    patterns: [
      /Permission denied/,
      /command not found/,
      /No such file or directory/,
      /port.*already in use/i,
      /EACCES/,
      /killed/i,
      /out of memory/i,
    ]
  }
];

function detectLanguage(errorText) {
  const scores = {};

  for (const { language, patterns } of LANGUAGE_PATTERNS) {
    scores[language] = 0;

    for (const pattern of patterns) {
      if (pattern.test(errorText)) {
        scores[language]++;
      }
    }
  }

  // find language with highest score
  const detected = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)[0];

  // if nothing matched return unknown
  if (!detected) return 'unknown';

  return detected[0];
}

module.exports = { detectLanguage };