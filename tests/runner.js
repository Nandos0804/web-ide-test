/**
 * Test Runner — executes all suites and prints an aggregate summary.
 * Usage: node tests/runner.js
 */

import { run as suite01 } from './01-page-load.js';
import { run as suite02 } from './02-editor.js';
import { run as suite03 } from './03-playback.js';
import { run as suite04 } from './04-file-mgmt.js';
import { logger } from '../utils/reporter.js';

const suites = [suite01, suite02, suite03, suite04];

async function main() {
  logger.info('Csound IDE — Puppeteer Test Suite');
  logger.info('https://ide.csound.com');

  const summaries = [];

  for (const suite of suites) {
    try {
      const result = await suite();
      summaries.push(result);
    } catch (err) {
      logger.error({ err }, 'Suite threw an unhandled error');
      summaries.push({
        suiteName: 'unknown',
        passed: 0,
        failed: 1,
        skipped: 0,
      });
    }
  }

  // Aggregate totals
  const total = summaries.reduce(
    (acc, s) => ({
      passed: acc.passed + s.passed,
      failed: acc.failed + s.failed,
      skipped: acc.skipped + s.skipped,
    }),
    { passed: 0, failed: 0, skipped: 0 }
  );

  logger.info('OVERALL RESULTS');
  for (const s of summaries) {
    const level = s.failed > 0 ? 'error' : 'info';
    logger[level](
      {
        suite: s.suiteName,
        passed: s.passed,
        failed: s.failed,
        skipped: s.skipped,
      },
      '%s %s  %d✅ %d❌ %d⏭',
      s.failed > 0 ? '❌' : '✅',
      s.suiteName,
      s.passed,
      s.failed,
      s.skipped
    );
  }
  logger.info(
    total,
    'Total: %d passed · %d failed · %d skipped',
    total.passed,
    total.failed,
    total.skipped
  );

  process.exit(total.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  logger.fatal({ err }, 'Runner failed');
  process.exit(1);
});
