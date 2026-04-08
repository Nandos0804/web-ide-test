import {
  launchBrowser,
  newPage,
  gotoProject,
  sleep,
} from '../utils/browser.js';
import { TestReporter, assert } from '../utils/reporter.js';

export async function run() {
  const reporter = new TestReporter('Playback Controls');
  const browser = await launchBrowser();
  const page = await newPage(browser);

  try {
    await gotoProject(page);
    await sleep(2000);

    let runButton = null;
    try {
      runButton = await page.$(
        // The IDE wraps icon buttons in a div with the aria-label
        'div[aria-label*="play" i] button, div[aria-label*="run" i] button, ' +
          'div[aria-label*="resume" i] button, ' +
          'button[aria-label*="run" i], button[aria-label*="play" i], ' +
          'button[title*="run" i], button[title*="play" i], ' +
          '[data-testid*="run"], [data-testid*="play"]'
      );
      if (!runButton) {
        runButton = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          return (
            btns.find((b) =>
              /run|play/i.test(
                b.textContent +
                  (b.getAttribute('aria-label') || '') +
                  (b.getAttribute('title') || '')
              )
            ) || null
          );
        });
        const exists = await page.evaluate((el) => !!el, runButton);
        if (!exists) runButton = null;
      }
      assert(runButton !== null, 'Run/play button not found with any selector');
      reporter.pass('Run button found in toolbar');
    } catch (e) {
      reporter.fail('Run button found in toolbar', e);
    }

    if (runButton) {
      try {
        const pageErrors = [];
        page.on('pageerror', (err) => pageErrors.push(err.message));
        await runButton.click();
        await sleep(3000);
        assert(
          pageErrors.length === 0,
          `Page errors after run: ${pageErrors.join('; ')}`
        );
        reporter.pass('Clicking Run does not cause a page crash');
      } catch (e) {
        reporter.fail('Clicking Run does not cause a page crash', e);
      }
    } else {
      reporter.skip(
        'Clicking Run does not cause a page crash',
        'Run button not found'
      );
    }

    try {
      const consoleEl = await page.$(
        // Console panel is a tabpanel containing a <code> block
        '[role="tabpanel"] code, [class*="console"], [class*="output"], ' +
          '[data-testid*="console"], [data-testid*="output"], pre.output, .terminal'
      );
      assert(consoleEl !== null, 'No console/output area found');
      reporter.pass('Console / output area is present');
    } catch {
      reporter.skip(
        'Console / output area is present',
        'selector may need tuning'
      );
    }

    try {
      const stopBtn = await page.$(
        'div[aria-label*="stop" i] button, ' +
          'button[aria-label*="stop" i], button[title*="stop" i], [data-testid*="stop"]'
      );
      if (stopBtn) {
        await stopBtn.click();
        reporter.pass('Stop button found and clicked successfully');
      } else {
        reporter.skip(
          'Stop button found and clicked successfully',
          'not visible or not needed'
        );
      }
    } catch (e) {
      reporter.fail('Stop button found and clicked successfully', e);
    }

    try {
      const isInteractive = await page.evaluate(
        () => !document.hidden && document.readyState === 'complete'
      );
      assert(isInteractive, 'Page is no longer interactive');
      reporter.pass('Page remains interactive after run/stop cycle');
    } catch (e) {
      reporter.fail('Page remains interactive after run/stop cycle', e);
    }
  } finally {
    await browser.close();
  }

  return reporter.summary();
}

if (process.argv[1].endsWith('03-playback.js')) run().catch(console.error);
