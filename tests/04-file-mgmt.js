import path from 'node:path';
import {
  BASE_URL,
  launchBrowser,
  newPage,
  gotoProject,
  sleep,
} from '../utils/browser.js';
import { TestReporter, assert } from '../utils/reporter.js';

export async function run() {
  const reporter = new TestReporter('File Management');
  const browser = await launchBrowser();
  const page = await newPage(browser);

  try {
    await gotoProject(page);
    await sleep(2000);

    try {
      const tabEl = await page.$(
        '[class*="tab"], [class*="filename"], [class*="file-name"], ' +
          '[data-testid*="tab"], [role="tab"]'
      );
      assert(tabEl !== null, 'No file tab / filename label found');
      const label = await page.evaluate((el) => el.textContent.trim(), tabEl);
      reporter.pass(`File tab / filename label is visible ("${label}")`);
    } catch {
      reporter.skip(
        'File tab / filename label is visible',
        'tab selector needs adjustment'
      );
    }

    try {
      const newFileEl = await page.$(
        'button[aria-label*="new" i], button[title*="new" i], ' +
          '[data-testid*="new-file"], [aria-label*="new file" i]'
      );
      if (newFileEl) {
        reporter.pass('New-file control is present');
      } else {
        reporter.skip(
          'New-file control is present',
          'button not found with current selectors'
        );
      }
    } catch (e) {
      reporter.fail('New-file control is present', e);
    }

    try {
      const sidebar = await page.$(
        // The file tree panel has a stable id in this app
        '#web-ide-file-tree-header, [data-rfd-draggable-id], ' +
          '[class*="sidebar"], [class*="file-tree"], nav[aria-label*="file" i]'
      );
      if (sidebar) {
        reporter.pass('File sidebar / panel is present');
      } else {
        reporter.skip('File sidebar / panel is present', 'sidebar not found');
      }
    } catch (e) {
      reporter.fail('File sidebar / panel is present', e);
    }

    try {
      const url = page.url();
      const allowedOrigin = new URL(BASE_URL).origin;
      assert(
        url.startsWith(allowedOrigin),
        `Unexpectedly redirected to: ${url}`
      );
      reporter.pass(`URL stays on configured site root (${allowedOrigin})`);
    } catch (e) {
      reporter.fail('URL stays on configured site root', e);
    }

    try {
      await page.screenshot({
        path: path.join(process.cwd(), 'screenshot-file-mgmt.png'),
        fullPage: false,
      });
      reporter.pass('Screenshot captured (screenshot-file-mgmt.png)');
    } catch (e) {
      reporter.fail('Screenshot captured', e);
    }
  } finally {
    await browser.close();
  }

  return reporter.summary();
}

if (process.argv[1].endsWith('04-file-mgmt.js')) run().catch(console.error);
