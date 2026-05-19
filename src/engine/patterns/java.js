'use strict';

const JAVA_PATTERNS = [
  {
    pattern: /NullPointerException/,
    what: () => `A variable is null when you tried to use it`,
    where: (m, raw) => extractLine(raw),
    why: () => `You called a method or accessed a property on an object that is null`,
    fix: () => `Add a null check before using the variable: if (variable != null) { ... }`,
    type: 'NullPointerException'
  },
  {
    pattern: /ArrayIndexOutOfBoundsException: Index (\d+) out of bounds for length (\d+)/,
    what: (m) => `Array index ${m[1]} does not exist — array only has ${m[2]} elements`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `You tried to access index ${m[1]} but the array length is ${m[2]}`,
    fix: () => `Check array length before accessing: if (index < array.length) { ... }`,
    type: 'ArrayIndexOutOfBoundsException'
  },
  {
    pattern: /ClassNotFoundException: (.+)/,
    what: (m) => `Java cannot find the class '${m[1]}'`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `'${m[1]}' is not in your classpath or the dependency is missing`,
    fix: () => `Check your pom.xml or build.gradle and make sure the dependency is included`,
    type: 'ClassNotFoundException'
  },
  {
    pattern: /NumberFormatException: For input string: "(.+)"/,
    what: (m) => `Cannot convert '${m[1]}' to a number`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `'${m[1]}' is not a valid number format`,
    fix: () => `Validate the string before parsing: check it contains only digits`,
    type: 'NumberFormatException'
  },
  {
    pattern: /StackOverflowError/,
    what: () => `Function called itself too many times and ran out of stack space`,
    where: (m, raw) => extractLine(raw),
    why: () => `Infinite recursion — a method keeps calling itself with no exit condition`,
    fix: () => `Add a base case that stops the recursive calls`,
    type: 'StackOverflowError'
  },
  {
    pattern: /ClassCastException: (.+) cannot be cast to (.+)/,
    what: (m) => `Cannot cast '${m[1]}' to '${m[2]}'`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `These two types are incompatible — '${m[1]}' is not a '${m[2]}'`,
    fix: () => `Use instanceof to check the type before casting`,
    type: 'ClassCastException'
  },
  {
    pattern: /OutOfMemoryError: Java heap space/,
    what: () => `Java ran out of memory`,
    where: () => 'JVM',
    why: () => `Your application is using more memory than the JVM heap allows`,
    fix: () => `Increase heap size with: java -Xmx512m YourClass — or check for memory leaks`,
    type: 'OutOfMemoryError'
  },
  {
    pattern: /FileNotFoundException: (.+) \(No such file or directory\)/,
    what: (m) => `File '${m[1]}' does not exist`,
    where: (m, raw) => extractLine(raw),
    why: (m) => `Java cannot find the file at path '${m[1]}'`,
    fix: (m) => `Check that '${m[1]}' exists and the path is correct`,
    type: 'FileNotFoundException'
  },
];

function extractLine(raw) {
  const match = raw.match(/at .+\((.+)\.java:(\d+)\)/);
  if (match) return `${match[1]}.java line ${match[2]}`;
  return 'Check the stack trace above';
}

function matchJava(errorText) {
  for (const entry of JAVA_PATTERNS) {
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

module.exports = { matchJava };