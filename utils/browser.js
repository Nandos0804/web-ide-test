import 'dotenv/config';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
import { BASE_URL, PROJECT_URL } from './const.js';

function resolveChromePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.GOOGLE_CHROME_BIN,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome-stable',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'No Chrome/Chromium executable found. Set PUPPETEER_EXECUTABLE_PATH or install a local browser.'
  );
}

export async function launchBrowser(headless) {
  if (headless === undefined) {
    headless = process.env.HEADLESS !== 'false';
  }
  const browser = await puppeteer.launch({
    executablePath: resolveChromePath(),
    headless,
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--autoplay-policy=no-user-gesture-required',
      '--proxy-bypass-list=*',
      '--proxy-server=direct://',
    ],
  });
  return browser;
}

export async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Bypass proxy auth challenges
  await page.authenticate({ username: '', password: '' });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`  [browser error] ${msg.text()}`);
    }
  });

  return page;
}

export async function gotoIDE(page, path = '') {
  await page.goto(`${BASE_URL}${path}`, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
}

export async function gotoProject(page) {
  await page.goto(PROJECT_URL, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  // Wait for React+Redux to hydrate and CM6 editor to mount
  await page.waitForSelector('.cm-editor', { timeout: 10000 });
}

/** Replacement for the removed page.waitForTimeout */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { BASE_URL, PROJECT_URL };
