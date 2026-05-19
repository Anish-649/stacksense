const { matchPython } = require('../src/engine/patterns/python');
const { matchNode } = require('../src/engine/patterns/node');
const { matchJava } = require('../src/engine/patterns/java');
const { matchGit } = require('../src/engine/patterns/git');
const { detectLanguage } = require('../src/engine/detector');

// ─── Python pattern tests ───────────────────────────────

describe('Python patterns', () => {

  test('detects ModuleNotFoundError', () => {
    const error = `ModuleNotFoundError: No module named 'pandas'`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('ImportError');
    expect(result.fix).toContain('pip install pandas');
  });

  test('detects ZeroDivisionError', () => {
    const error = `ZeroDivisionError: division by zero`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('ZeroDivisionError');
  });

  test('detects NameError', () => {
    const error = `NameError: name 'foo' is not defined`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('NameError');
    expect(result.what).toContain('foo');
  });

  test('detects FileNotFoundError', () => {
    const error = `FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('FileNotFoundError');
    expect(result.fix).toContain('data.csv');
  });

  test('detects IndexError', () => {
    const error = `IndexError: list index out of range`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('IndexError');
  });

  test('detects KeyError', () => {
    const error = `KeyError: 'username'`;
    const result = matchPython(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('KeyError');
  });

  test('returns null for unknown Python error', () => {
    const error = `QuantumFluxError: reactor core mismatch`;
    const result = matchPython(error);
    expect(result).toBeNull();
  });

});

// ─── Node patterns tests ────────────────────────────────

describe('Node patterns', () => {

  test('detects Cannot find module', () => {
    const error = `Error: Cannot find module './utils'`;
    const result = matchNode(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('ModuleNotFoundError');
    expect(result.fix).toContain('./utils');
  });

  test('detects EADDRINUSE', () => {
    const error = `Error: EADDRINUSE: address already in use :::3000`;
    const result = matchNode(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('PortError');
    expect(result.fix).toContain('3000');
  });

  test('detects ReferenceError', () => {
    const error = `ReferenceError: myVar is not defined`;
    const result = matchNode(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('ReferenceError');
    expect(result.what).toContain('myVar');
  });

  test('detects TypeError not a function', () => {
    const error = `TypeError: myFunction is not a function`;
    const result = matchNode(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('TypeError');
  });

  test('detects ENOENT', () => {
    const error = `Error: ENOENT: no such file or directory, open 'config.json'`;
    const result = matchNode(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('FileNotFoundError');
  });

  test('returns null for unknown Node error', () => {
    const error = `SomeWeirdError: something strange happened`;
    const result = matchNode(error);
    expect(result).toBeNull();
  });

});

// ─── Java pattern tests ─────────────────────────────────

describe('Java patterns', () => {

  test('detects NullPointerException', () => {
    const error = `Exception in thread "main" java.lang.NullPointerException`;
    const result = matchJava(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('NullPointerException');
  });

  test('detects ArrayIndexOutOfBoundsException', () => {
    const error = `ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 3`;
    const result = matchJava(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('ArrayIndexOutOfBoundsException');
    expect(result.what).toContain('5');
    expect(result.what).toContain('3');
  });

  test('detects StackOverflowError', () => {
    const error = `java.lang.StackOverflowError`;
    const result = matchJava(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('StackOverflowError');
  });

  test('returns null for unknown Java error', () => {
    const error = `SomeCustomException: something weird`;
    const result = matchJava(error);
    expect(result).toBeNull();
  });

});

// ─── Git pattern tests ──────────────────────────────────

describe('Git patterns', () => {

  test('detects not a git repository', () => {
    const error = `fatal: not a git repository`;
    const result = matchGit(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('NotARepository');
  });

  test('detects merge conflict', () => {
    const error = `CONFLICT (content): Merge conflict in src/index.js`;
    const result = matchGit(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('MergeConflict');
    expect(result.where).toContain('src/index.js');
  });

  test('detects push failed', () => {
    const error = `error: failed to push some refs to 'https://github.com/user/repo'`;
    const result = matchGit(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('PushFailed');
  });

  test('detects SSH error', () => {
    const error = `Permission denied (publickey)`;
    const result = matchGit(error);
    expect(result).not.toBeNull();
    expect(result.type).toBe('SSHError');
  });

});

// ─── Language detector tests ─────────────────────────────

describe('Language detector', () => {

  test('detects python from traceback', () => {
    const error = `Traceback (most recent call last):\n  File "app.py", line 5\nModuleNotFoundError: No module named 'pandas'`;
    expect(detectLanguage(error)).toBe('python');
  });

  test('detects node from Cannot find module', () => {
    const error = `Error: Cannot find module './utils'\n    at Object.<anonymous>`;
    expect(detectLanguage(error)).toBe('node');
  });

  test('detects java from exception', () => {
    const error = `Exception in thread "main" java.lang.NullPointerException\n    at Main.main(Main.java:8)`;
    expect(detectLanguage(error)).toBe('java');
  });

  test('detects git from fatal', () => {
    const error = `fatal: not a git repository (or any of the parent directories): .git`;
    expect(detectLanguage(error)).toBe('git');
  });

  test('returns unknown for unrecognized error', () => {
    const error = `something completely unrecognizable xyzabc`;
    expect(detectLanguage(error)).toBe('unknown');
  });

});