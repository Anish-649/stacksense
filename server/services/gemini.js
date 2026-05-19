'use strict';

require('dotenv').config();
const axios = require('axios');

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
function buildPrompt(errorText, language) {
  return `
You are an expert programming assistant helping a developer understand a terminal error.

Language detected: ${language === 'unknown' ? 'auto-detect from error' : language}

Analyze this error and respond ONLY with a valid JSON object.
No markdown. No explanation outside the JSON. No backticks.

Return exactly this structure:
{
  "what": "one sentence — what went wrong in plain English",
  "where": "file name and line number if visible, otherwise see error above",
  "why": "simple explanation of the root cause",
  "fix": "one specific actionable fix the developer can apply right now",
  "type": "error category name"
}

Error:
${errorText}
  `.trim();
}

async function callGemini(errorText, language) {
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [1000, 2000];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        GEMINI_URL,
        {
          contents: [
            {
              parts: [{ text: buildPrompt(errorText, language) }]
            }
          ]
        },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const raw = response.data.candidates[0].content.parts[0].text;

      const cleaned = raw
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        what: parsed.what || 'Unknown error',
        where: parsed.where || 'See error above',
        why: parsed.why || 'Could not determine root cause',
        fix: parsed.fix || 'Check the error message above',
        type: parsed.type || 'UnknownError',
        source: 'gemini'
      };

    } catch (err) {
      const isLastAttempt = attempt === MAX_RETRIES;

      if (isLastAttempt) {
        console.error('Gemini error details:', err.response?.data || err.message);
        throw new Error(`Gemini API failed after ${MAX_RETRIES + 1} attempts: ${err.message}`);
      }

      await new Promise(res => setTimeout(res, RETRY_DELAYS[attempt]));
    }
  }
}

module.exports = { callGemini };