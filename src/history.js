'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

const DB_DIR = path.join(os.homedir(), '.stacksense');
const DB_PATH = path.join(DB_DIR, 'history.db');
const LOG_PATH = path.join(DB_DIR, 'history.txt');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS errors (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT,
    language    TEXT,
    raw_error   TEXT,
    what        TEXT,
    where_text  TEXT,
    why         TEXT,
    fix         TEXT,
    source      TEXT,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function saveToTextLog(result, rawError) {
  try {
    const time = new Date().toLocaleString();
    const divider = '─'.repeat(60);
    const entry = `
${divider}
${time}  ·  ${result.language || 'unknown'}  ·  ${result.type || 'Error'}
${divider}
Error:
${rawError.trim().substring(0, 500)}

What:   ${result.what}
Where:  ${result.where}
Why:    ${result.why}
Fix:    ${result.fix}
Source: ${result.source}

`;
    fs.appendFileSync(LOG_PATH, entry, 'utf8');
  } catch (err) {
    // never crash CLI because of logging
  }
}

function saveError(result, rawError) {
  try {
    const stmt = db.prepare(`
      INSERT INTO errors 
        (type, language, raw_error, what, where_text, why, fix, source)
      VALUES
        (@type, @language, @raw_error, @what, @where_text, @why, @fix, @source)
    `);

    stmt.run({
      type:       result.type || 'Unknown',
      language:   result.language || 'unknown',
      raw_error:  rawError.substring(0, 1000),
      what:       result.what,
      where_text: result.where,
      why:        result.why,
      fix:        result.fix,
      source:     result.source
    });

    saveToTextLog(result, rawError);

  } catch (err) {
    console.error('  history save failed:', err.message);
  }
}

function getHistory(limit = 10) {
  try {
    return db.prepare(`
      SELECT * FROM errors 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(limit);
  } catch (err) {
    return [];
  }
}

function getPatterns() {
  try {
    return db.prepare(`
      SELECT 
        type,
        language,
        COUNT(*) as count,
        MAX(timestamp) as last_seen
      FROM errors
      GROUP BY type, language
      ORDER BY count DESC
      LIMIT 10
    `).all();
  } catch (err) {
    return [];
  }
}

function searchSimilar(errorType, language) {
  try {
    return db.prepare(`
      SELECT * FROM errors
      WHERE type = ? AND language = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `).get(errorType, language);
  } catch (err) {
    return null;
  }
}

module.exports = { saveError, getHistory, getPatterns, searchSimilar, LOG_PATH };