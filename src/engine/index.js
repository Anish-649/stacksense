'use strict';

const { detectLanguage } = require('./detector');
const { matchPython } = require('./patterns/python');
const { matchNode } = require('./patterns/node');
const { matchJava } = require('./patterns/java');
const { matchGit } = require('./patterns/git');
const { matchGeneral } = require('./patterns/general');
const { gemininFallback } = require('./fallback/gemini');

const MATCHERS = {
  python: matchPython,
  node: matchNode,
  java: matchJava,
  git: matchGit,
  general: matchGeneral,
};

async function analyzeError(errorText) {
  // step 1 — detect language
  const language = detectLanguage(errorText);
  console.log(`\n[StackSense] Detected: ${language}`);

  // step 2 — run pattern engine for detected language
  if (language !== 'unknown') {
    const matcher = MATCHERS[language];

    if (matcher) {
      const result = matcher(errorText);

      if (result) {
        console.log(`[StackSense] Pattern matched — no API call needed\n`);
        return { ...result, language };
      }
    }
  }

  // step 3 — no pattern matched, try general patterns
  const generalResult = matchGeneral(errorText);
  if (generalResult) {
    console.log(`[StackSense] General pattern matched — no API call needed\n`);
    return { ...generalResult, language };
  }

  // step 4 — nothing matched, fall back to Gemini
  console.log(`[StackSense] No pattern matched — calling Gemini API\n`);
  const fallbackResult = await gemininFallback(errorText, language);
  return { ...fallbackResult, language };
}

module.exports = { analyzeError };