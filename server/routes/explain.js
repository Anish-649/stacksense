'use strict';

const express = require('express');
const router = express.Router();
const { sanitizeError } = require('../../src/sanitize');
const { detectLanguage } = require('../../src/engine/detector');
const { matchPython } = require('../../src/engine/patterns/python');
const { matchNode } = require('../../src/engine/patterns/node');
const { matchJava } = require('../../src/engine/patterns/java');
const { matchGit } = require('../../src/engine/patterns/git');
const { matchGeneral } = require('../../src/engine/patterns/general');
const { callGemini } = require('../services/gemini');
const { searchSimilar } = require('../../src/history');

const MATCHERS = {
  python: matchPython,
  node: matchNode,
  java: matchJava,
  git: matchGit,
  general: matchGeneral,
};

router.post('/explain', async (req, res) => {
  try {
    const { errorText } = req.body;

    if (!errorText || errorText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'errorText is required'
      });
    }

    const sanitized = sanitizeError(errorText);
    const language = detectLanguage(sanitized);

    console.log(`\n[StackSense] Detected: ${language}`);

    // layer 1 — pattern engine
    if (language !== 'unknown') {
      const matcher = MATCHERS[language];
      if (matcher) {
        const result = matcher(sanitized);
        if (result) {
          console.log(`[StackSense] Layer 1 matched — pattern engine`);
          return res.status(200).json({
            success: true,
            data: { ...result, language }
          });
        }
      }
    }

    // try general patterns
    const generalResult = matchGeneral(sanitized);
    if (generalResult) {
      console.log(`[StackSense] Layer 1 matched — general patterns`);
      return res.status(200).json({
        success: true,
        data: { ...generalResult, language }
      });
    }

    // layer 2 — search history database
    console.log(`[StackSense] Layer 2 — searching history database`);

    // extract error type from text for history search
    const errorType = extractErrorType(sanitized);

    if (errorType) {
      const historical = searchSimilar(errorType, language);

      if (historical) {
        console.log(`[StackSense] Layer 2 matched — found in history`);
        return res.status(200).json({
          success: true,
          data: {
            what: historical.what,
            where: historical.where_text,
            why: historical.why,
            fix: historical.fix,
            type: historical.type,
            language: historical.language,
            source: 'history'
          }
        });
      }
    }

    // layer 3 — gemini api
    console.log(`[StackSense] Layer 3 — calling Gemini API`);
    const geminiResult = await callGemini(sanitized, language);
    return res.status(200).json({
      success: true,
      data: { ...geminiResult, language }
    });

  } catch (err) {
    console.error('Route error:', err.message);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

function extractErrorType(errorText) {
  const patterns = [
    /([A-Z][a-zA-Z]+Error)/,
    /([A-Z][a-zA-Z]+Exception)/,
    /error TS\d+/i,
    /(ENOENT|EADDRINUSE|EACCES|ECONNREFUSED)/,
  ];

  for (const pattern of patterns) {
    const match = errorText.match(pattern);
    if (match) return match[1];
  }

  return null;
}

module.exports = router;