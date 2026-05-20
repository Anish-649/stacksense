'use strict';

require('dotenv').config();
const axios = require('axios');
const { saveError } = require('./history');

const SERVER_URL = process.env.STACKSENSE_SERVER_URL || 'https://stacksense.onrender.com';

async function explainError(errorText) {
  try {
    if (!errorText || errorText.trim().length === 0) {
      return {
        what: 'No error text was captured',
        where: 'Unknown',
        why: 'The command failed but produced no readable error output',
        fix: 'Run the command manually and check the output',
        type: 'NoOutput',
        language: 'unknown',
        source: 'internal'
      };
    }

    const response = await axios.post(
      `${SERVER_URL}/api/explain`,
      { errorText },
      {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.data.success) {
      const result = response.data.data;

      // save to local history
      saveError(result, errorText);

      return result;
    }

    throw new Error(response.data.error || 'Server returned unsuccessful response');

  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.log('[StackSense] Server unreachable — running local engine\n');

      const { analyzeError } = require('./engine/index');
      const result = await analyzeError(errorText);

      // save to local history even when server is down
      saveError(result, errorText);

      return result;
    }

    return {
      what: 'StackSense could not analyze this error',
      where: 'Unknown',
      why: err.message || 'Unexpected error occurred',
      fix: 'Check your internet connection or run the StackSense server locally',
      type: 'ConnectionError',
      language: 'unknown',
      source: 'internal'
    };
  }
}

module.exports = { explainError };