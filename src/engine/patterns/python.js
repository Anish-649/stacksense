'use strict';

const PYTHON_PATTERNS = [
  {
    pattern: /ModuleNotFoundError: No module named '(.+)'/,
    what: (m) => `Python cannot find the module '${m[1]}'`,
    where: (m, raw) => extractLine(raw),
    why: () => 'The package is not installed in your Python environment',
    fix: (m) => `Run: pip install ${m[1]}`,
    type: 'ImportError'
  },
  {
    pattern: /ImportError: cannot import name '(.+)' from '(.+)'/,
    what: (m) => `Cannot import '${m[1]}' from '${m[2]}'`,
    where: (m, raw) => extractLine(raw),
    why: () => 'The function or class does not exist in that module, or the module version is wrong',
    fix: (m) => `Check the ${m[2]} documentation for the correct import name, or run: pip install --upgrade ${m[2]}`,
    type: 'ImportError'
  },
  {
    pattern: /IndentationError: (.+)/,
    what: (m) => `Indentation error — ${m[1]}`,
    where: (m, raw) => extractLine(raw),
    why: () => 'Python uses indentation to define code blocks. Mixing tabs and spaces or wrong indentation causes this',
    fix: () => 'Use only spaces (4 spaces per indent level) and never mix tabs with spaces',
    type: 'IndentationError'
  },
  {
    pattern: /NameError: name '(.+)' is not defined/,
    what: (m) => `Variable or function '${m[1]}' is not defined`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `You are trying to use '${m[1]}' before defining it, or you have a typo in the name`,
    fix: (m) => `Define '${m[1]}' before using it, or check for typos in the variable name`,
    type: 'NameError'
  },
  {
    pattern: /TypeError: '(.+)' object is not subscriptable/,
    what: (m) => `You tried to use index brackets [] on a '${m[1]}' object`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `'${m[1]}' type does not support indexing with []`,
    fix: () => 'Check that the variable is a list, dict, or string before indexing it',
    type: 'TypeError'
  },
  {
    pattern: /TypeError: (.+) takes (\d+) positional argument but (\d+) were given/,
    what: (m) => `Function received wrong number of arguments`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `Function expects ${m[2]} argument but you passed ${m[3]}`,
    fix: (m) => `Check the function definition and pass exactly ${m[2]} argument(s)`,
    type: 'TypeError'
  },
  {
    pattern: /AttributeError: '(.+)' object has no attribute '(.+)'/,
    what: (m) => `'${m[1]}' object has no attribute called '${m[2]}'`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `Either '${m[2]}' is spelled wrong, or this method does not exist on '${m[1]}'`,
    fix: (m) => `Check the spelling of '${m[2]}' or use dir(your_object) to see available attributes`,
    type: 'AttributeError'
  },
  {
    pattern: /KeyError: '?(.+)'?$/m,
    what: (m) => `Key '${m[1]}' does not exist in the dictionary`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `You are trying to access a dictionary key '${m[1]}' that has not been set`,
    fix: (m) => `Use dict.get('${m[1]}') instead, or check if the key exists first with: if '${m[1]}' in dict`,
    type: 'KeyError'
  },
  {
    pattern: /IndexError: list index out of range/,
    what: () => 'You tried to access a list index that does not exist',
    where: (m, raw) => extractLine(raw),
    why: () => 'The index you used is larger than the list length',
    fix: () => 'Check the list length with len(your_list) before accessing by index',
    type: 'IndexError'
  },
  {
    pattern: /ValueError: (.+)/,
    what: (m) => `Invalid value — ${m[1]}`,
    where: (m, raw) => extractLine(raw),
    why: () => 'A function received an argument of the right type but an inappropriate value',
    fix: () => 'Check the value you are passing matches what the function expects',
    type: 'ValueError'
  },
  {
    pattern: /FileNotFoundError: \[Errno 2\] No such file or directory: '(.+)'/,
    what: (m) => `File '${m[1]}' does not exist`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `Python cannot find the file at path '${m[1]}'`,
    fix: (m) => `Check that '${m[1]}' exists and the path is correct. Use os.path.exists('${m[1]}') to verify`,
    type: 'FileNotFoundError'
  },
  {
    pattern: /ZeroDivisionError: division by zero/,
    what: () => 'Your code tried to divide a number by zero',
    where: (m, raw) => extractLine(raw),
    why: () => 'Division by zero is mathematically undefined',
    fix: () => 'Add a check before dividing: if denominator != 0: result = numerator / denominator',
    type: 'ZeroDivisionError'
  },
  {
    pattern: /RecursionError: maximum recursion depth exceeded/,
    what: () => 'Your function called itself too many times',
    where: (m, raw) => extractLine(raw),
    why: () => 'The recursive function has no base case or the base case is never reached',
    fix: () => 'Add a base case that stops the recursion, or check your logic to prevent infinite recursive calls',
    type: 'RecursionError'
  },
  {
    pattern: /SyntaxError: (.+)/,
    what: (m) => `Syntax error — ${m[1]}`,
    where: (m, raw) => extractLine(raw),
    why: () => 'Python cannot parse your code because of invalid syntax',
    fix: () => 'Check for missing colons, brackets, quotes, or incorrect indentation near the line shown',
    type: 'SyntaxError'
  },
];

// helper to extract line number from traceback
function extractLine(raw) {
  const match = raw.match(/File "(.+)", line (\d+)/);
  if (match) return `${match[1]} line ${match[2]}`;
  return 'Check the traceback above';
}

function matchPython(errorText) {
  for (const entry of PYTHON_PATTERNS) {
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

module.exports = { matchPython };