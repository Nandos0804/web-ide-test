import pino from 'pino';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'HH:MM:ss.l',
  },
});

const logger = pino(transport);

export class TestReporter {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.results = [];
    this.startTime = Date.now();
    this.log = logger.child({ suite: suiteName });
    this.log.info('suite started');
  }

  pass(name) {
    this.results.push({ name, status: 'pass' });
    this.log.info({ test: name, status: 'pass' }, '✅ %s', name);
  }

  fail(name, error) {
    this.results.push({ name, status: 'fail', error });
    const msg = error instanceof Error ? error.message : String(error);
    this.log.error({ test: name, status: 'fail', error: msg }, '❌ %s', name);
  }

  skip(name, reason = '') {
    this.results.push({ name, status: 'skip' });
    this.log.warn(
      { test: name, status: 'skip', reason },
      '⏭  %s%s',
      name,
      reason ? ` (${reason})` : ''
    );
  }

  summary() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const passed = this.results.filter((r) => r.status === 'pass').length;
    const failed = this.results.filter((r) => r.status === 'fail').length;
    const skipped = this.results.filter((r) => r.status === 'skip').length;
    this.log.info(
      { passed, failed, skipped, elapsed: `${elapsed}s` },
      'suite finished — %d passed · %d failed · %d skipped (%ss)',
      passed,
      failed,
      skipped,
      elapsed
    );
    return { passed, failed, skipped, suiteName: this.suiteName };
  }
}

/**
 * Thin assert helper — throws on failure so the test catches it.
 */
export function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

export { logger };
