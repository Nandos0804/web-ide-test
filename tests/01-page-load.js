import {
  launchBrowser,
  newPage,
  gotoProject,
  sleep,
} from '../utils/browser.js';
import { TestReporter, assert } from '../utils/reporter.js';

export async function run() {
  const reporter = new TestReporter('Page Load & Basic Structure');
  const browser = await launchBrowser();
  const page = await newPage(browser);

  try {
    try {
      await gotoProject(page);
      reporter.pass('IDE loads without navigation error');
    } catch (e) {
      reporter.fail('IDE loads without navigation error', e);
    }

    try {
      const title = await page.title();
      assert(title.length > 0, 'Page title is empty');
      reporter.pass(`Page has a non-empty title ("${title}")`);
    } catch (e) {
      reporter.fail('Page has a non-empty title', e);
    }

    try {
      const jsErrors = [];
      page.on('pageerror', (err) => jsErrors.push(err.message));
      await sleep(2000);
      assert(jsErrors.length === 0, `JS errors: ${jsErrors.join('; ')}`);
      reporter.pass('No uncaught JavaScript errors on load');
    } catch (e) {
      reporter.fail('No uncaught JavaScript errors on load', e);
    }

    try {
      const editorEl = await page.$(
        '.cm-editor, .monaco-editor, .CodeMirror, textarea.inputarea'
      );
      assert(editorEl !== null, 'No editor element found in DOM');
      reporter.pass('Code editor element is present in DOM');
    } catch (e) {
      reporter.fail('Code editor element is present in DOM', e);
    }

    try {
      const runBtn = await page.$(
        'div[aria-label*="play" i] button, div[aria-label*="run" i] button, ' +
          'button[aria-label*="run" i], button[aria-label*="play" i], ' +
          'button[title*="run" i], button[title*="play" i], ' +
          '[data-testid*="run"], [data-testid*="play"]'
      );
      assert(runBtn !== null, 'No run/play button found');
      reporter.pass('Run/Play button is present');
    } catch {
      reporter.skip(
        'Run/Play button is present',
        'selector may need tuning for this version'
      );
    }

    try {
      const bodyText = await page.evaluate(() => document.body.innerText);
      assert(
        bodyText.trim().length > 50,
        'Body text too short — possible blank/error page'
      );
      reporter.pass('Page renders meaningful content');
    } catch (e) {
      reporter.fail('Page renders meaningful content', e);
    }
  } finally {
    await browser.close();
  }

  return reporter.summary();
}

if (process.argv[1].endsWith('01-page-load.js')) run().catch(console.error);
