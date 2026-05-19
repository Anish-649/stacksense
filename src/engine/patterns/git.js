'use strict';

const GIT_PATTERNS = [
  {
    pattern: /fatal: not a git repository/,
    what: () => `This folder is not a Git repository`,
    where: () => 'Current directory',
    why: () => `You ran a git command outside of a git project`,
    fix: () => `Run: git init — or navigate into your project folder first`,
    type: 'NotARepository'
  },
  {
    pattern: /CONFLICT \(content\): Merge conflict in (.+)/,
    what: (m) => `Merge conflict in file '${m[1]}'`,
    where: (m) => `${m[1]}`,
    why: () => `Two branches changed the same part of the file differently`,
    fix: (m) => `Open '${m[1]}', find the <<<<<<< markers, resolve manually, then run: git add ${m[1]} && git commit`,
    type: 'MergeConflict'
  },
  {
    pattern: /refusing to merge unrelated histories/,
    what: () => `Git refused to merge because the two branches have no common history`,
    where: () => 'git merge / git pull',
    why: () => `The two repos were created independently and share no commits`,
    fix: () => `Run: git pull origin main --allow-unrelated-histories`,
    type: 'UnrelatedHistories'
  },
  {
    pattern: /Your branch is behind '(.+)' by (\d+) commit/,
    what: (m) => `Your branch is ${m[2]} commit(s) behind '${m[1]}'`,
    where: () => 'git status',
    why: () => `Someone pushed changes to the remote that you have not pulled yet`,
    fix: () => `Run: git pull`,
    type: 'BranchBehind'
  },
  {
    pattern: /Permission denied \(publickey\)/,
    what: () => `SSH authentication failed`,
    where: () => 'git push / git pull',
    why: () => `Your SSH key is not set up or not added to GitHub`,
    fix: () => `Run: ssh-keygen -t ed25519 -C "your@email.com" then add the public key to GitHub Settings > SSH Keys`,
    type: 'SSHError'
  },
  {
    pattern: /error: failed to push some refs to '(.+)'/,
    what: (m) => `Push to '${m[1]}' failed`,
    where: () => 'git push',
    why: () => `The remote has changes that your local branch does not have`,
    fix: () => `Run: git pull --rebase origin main — then push again`,
    type: 'PushFailed'
  },
  {
    pattern: /pathspec '(.+)' did not match any file/,
    what: (m) => `File or branch '${m[1]}' does not exist`,
    where: () => 'git checkout / git add',
    why: (m) => `'${m[1]}' was not found in your working directory or git history`,
    fix: (m) => `Check the spelling of '${m[1]}' or run git status to see available files`,
    type: 'PathspecError'
  },
];

function matchGit(errorText) {
  for (const entry of GIT_PATTERNS) {
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

module.exports = { matchGit };