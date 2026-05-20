# StackSense

AI-powered CLI debugging assistant that explains terminal errors from any programming language in plain English — directly inside your terminal.

---

## Problem

When your code crashes you stop coding, open a browser, paste the error into ChatGPT, write a prompt, read the response, then switch back to terminal. That context switch breaks your flow every time.

---

## Solution

StackSense explains errors instantly — right below the original crash output. Never leave your terminal.

## How It Works

StackSense uses a three-layer analysis system:

**Layer 1 — Pattern Engine (local, instant, zero API calls)**
A custom regex pattern engine that recognizes common errors across Python, Node.js, Java and Git. Handles 60-70% of errors instantly with no network calls and no latency.

**Layer 2 — History Database (learned, gets smarter over time)**
A local SQLite database stores every error and its solution. When a known error recurs, StackSense retrieves the solution instantly from history — no API call needed. The more you use it, the smarter it gets.

**Layer 3 — Gemini AI Fallback (unknown errors only)**
For errors neither the pattern engine nor history recognizes, StackSense calls Google Gemini via a dedicated Express backend. The result is saved to history so the same error never hits the API twice.

## Structure
Error captured
↓
Layer 1 — Pattern engine → match? return instantly
↓
Layer 2 — History database → seen before? return instantly
↓
Layer 3 — Gemini API → explain + save to history

---

## Supported Languages

| Language | Pattern Engine | History | Gemini Fallback |
|----------|---------------|---------|-----------------|
| Python   | ✅            | ✅      | ✅              |
| Node.js  | ✅            | ✅      | ✅              |
| Java     | ✅            | ✅      | ✅              |
| Git      | ✅            | ✅      | ✅              |
| Any other | ❌           | ✅      | ✅              |

---

## Installation

Requirements: Node.js 18+, npm

```bash
npm install -g stacksense-cli        
```
Create a `.env` file:

Get a free Gemini key at [aistudio.google.com](https://aistudio.google.com)
GEMINI_API_KEY=your_api_key     //put this in .env file
---
## Commands

```bash
stacksense run python app.py       # run and explain errors
stacksense run node server.js
stacksense run java Main.java
stacksense run git push origin main

stacksense history                 # show last 10 errors
stacksense patterns                # show most repeated error types
stacksense log                     # print full error history
```

---

## Tech Stack

- Node.js + Commander.js — CLI framework
- Express.js — Backend API server
- SQLite (better-sqlite3) — Local history database
- Google Gemini 2.5 Flash — AI fallback
- Chalk — Terminal formatting
- Axios — HTTP client
- Helmet + express-rate-limit — Security
- Jest — Test suite (24 tests)

---



## Run Locally

```bash
# clone the repo
git clone https://github.com/anishkumar/stacksense
cd stacksense

# install dependencies
npm install

# add your Gemini key to .env
# start the backend server
npm start

# in a second terminal — install CLI globally
npm link

# run any command
stacksense run python yourfile.py
```

---

## Testing

```bash
npm test               # run all 24 tests
npm run test:coverage  # run with coverage report
```

Tests cover pattern engine accuracy across all supported languages and the language detector.

---

## Architecture
stacksense/
│
├── bin/
│   └── cli.js                  # CLI entry point
│
├── src/
│   ├── run.js                  # spawns command, captures stderr
│   ├── explain.js              # calls server, falls back locally
│   ├── formatter.js            # terminal output formatting
│   ├── sanitize.js             # strips secrets before API calls
│   ├── history.js              # SQLite history + text log
│   └── engine/
│       ├── index.js            # master controller
│       ├── detector.js         # language detection
│       ├── patterns/           # per-language pattern files
│       └── fallback/
│           └── gemini.js       # Gemini fallback
│
├── server/
│   ├── index.js                # Express server
│   ├── routes/explain.js       # POST /api/explain
│   └── services/gemini.js      # Gemini service layer
│
└── tests/
└── patterns.test.js        # 24 unit tests

---

## Security

- Error text sanitized before leaving your machine
- API keys, passwords, JWT tokens, database URLs stripped automatically
- Error text capped at 3000 characters
- Rate limited to 30 requests per minute per IP
- `.env` never committed to Git

---

## Engineering Decisions

**Why three layers instead of just calling AI directly?**
Common errors have deterministic fixes — calling an AI for `ModuleNotFoundError` wastes time and API quota. The pattern engine handles these instantly. The history layer means errors Gemini solved once never cost an API call again. Gemini is only called for genuinely unknown errors.

**Why a separate Express backend?**
The Gemini API key lives only on the server — never on the user's machine. Analysis logic can be updated without users reinstalling the CLI.

**Why local SQLite for history?**
No setup required, no internet needed, works offline. The architecture is designed so the local database can be connected to a shared server in the future — enabling collective error intelligence across all users.

**Why graceful degradation?**
If the server is unreachable, the CLI falls back to the local pattern engine automatically. Users never see a broken experience.

---

## Roadmap

- Opt-in collective error database — share anonymized errors across users for community-sourced fix suggestions
- Semantic similarity search using embeddings — find similar errors even when wording differs
- VS Code extension
- Docker log support
- CI/CD failure analysis

---
## Test case
 --npm run test:coverage

 PASS  tests/patterns.test.js
  Python patterns
    √ detects ModuleNotFoundError (7 ms)
    √ detects ZeroDivisionError (2 ms)
    √ detects NameError (2 ms)
    √ detects FileNotFoundError (2 ms)
    √ detects IndexError (2 ms)
    √ detects KeyError (3 ms)
    √ returns null for unknown Python error (1 ms)
  Node patterns
    √ detects Cannot find module (3 ms)
    √ detects EADDRINUSE (2 ms)
    √ detects ReferenceError (3 ms)
    √ detects TypeError not a function (2 ms)
    √ detects ENOENT (2 ms)
    √ returns null for unknown Node error (1 ms)
  Java patterns
    √ detects NullPointerException (6 ms)
    √ detects ArrayIndexOutOfBoundsException (2 ms)
    √ detects StackOverflowError (2 ms)
    √ returns null for unknown Java error (1 ms)
  Git patterns
    √ detects not a git repository (2 ms)
    √ detects merge conflict (2 ms)
    √ detects push failed (1 ms)
    √ detects SSH error (2 ms)
  Language detector
    √ detects python from traceback (5 ms)
    √ detects node from Cannot find module (3 ms)
    √ detects java from exception (1 ms)
    √ detects git from fatal (1 ms)
    √ returns unknown for unrecognized error (1 ms)

-----------------|---------|----------|---------|---------|---------------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s         
-----------------|---------|----------|---------|---------|---------------------------
All files        |      57 |       80 |   48.23 |   57.61 |                           
 engine          |     100 |      100 |     100 |     100 |                           
  detector.js    |     100 |      100 |     100 |     100 |                           
 engine/patterns |      54 |       75 |    47.3 |   54.82 |                           
  git.js         |   62.85 |      100 |   58.62 |   62.85 | 22-33,54-57,76            
  java.js        |   51.16 |       75 |   41.17 |   52.38 | 22-33,46-65               
  node.js        |   54.54 |    66.66 |   47.82 |   55.55 | 32-43,64-91               
  python.js      |   50.74 |       75 |   44.82 |   51.51 | 14-25,38-57,78-81,102-113 
-----------------|---------|----------|---------|---------|---------------------------
Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        2.125 s
Ran all test suites.

## License

MIT — Built by [Anish Kumar](https://github.com/anishkumar)