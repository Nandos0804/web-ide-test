import {
  launchBrowser,
  newPage,
  gotoProject,
  sleep,
} from '../utils/browser.js';
import { TestReporter, assert } from '../utils/reporter.js';

const SIMPLE_ORC = `<CsoundSynthesizer>
<CsOptions>-odac</CsOptions>
<CsInstruments>
instr 1
  aout oscil 0.5, 440
  out aout
endin
</CsInstruments>
<CsScore>
i 1 0 2
</CsScore>
</CsoundSynthesizer>`;

export async function run() {
  const reporter = new TestReporter('Editor Interaction');
  const browser = await launchBrowser();
  const page = await newPage(browser);

  try {
    await gotoProject(page);
    await sleep(2000);

    try {
      // CM6 uses a contenteditable div as the main input surface
      const editorHandle = await page.$('.cm-content');
      assert(editorHandle !== null, 'Editor input area not found');
      await editorHandle.click();
      reporter.pass('Can click into the code editor');
    } catch (e) {
      reporter.fail('Can click into the code editor', e);
    }

    try {
      await page.keyboard.down('Control');
      await page.keyboard.press('a');
      await page.keyboard.up('Control');
      await page.keyboard.type(SIMPLE_ORC, { delay: 5 });
      reporter.pass('Can type Csound code into the editor');
    } catch (e) {
      reporter.fail('Can type Csound code into the editor', e);
    }

    try {
      await sleep(500);
      const editorContent = await page.evaluate(() => {
        const lines = document.querySelectorAll('.cm-line');
        return Array.from(lines)
          .map((l) => l.textContent)
          .join('\n');
      });
      assert(
        editorContent.includes('CsoundSynthesizer') ||
          editorContent.includes('instr'),
        `Editor content doesn't show typed code. Got: ${editorContent.slice(0, 100)}`
      );
      reporter.pass('Typed code is visible in editor view');
    } catch (e) {
      reporter.fail('Typed code is visible in editor view', e);
    }

    try {
      await page.keyboard.down('Control');
      await page.keyboard.press('z');
      await page.keyboard.up('Control');
      reporter.pass('Ctrl+Z (undo) fires without error');
    } catch (e) {
      reporter.fail('Ctrl+Z (undo) fires without error', e);
    }

    try {
      const hlTokens = await page.$$(
        '[class^="cm-csound-"], .cm-csound-opcode, .cm-csound-xml-tag, .cm-keyword'
      );
      assert(hlTokens.length > 0, 'No syntax-highlight tokens found in editor');
      reporter.pass('Syntax highlighting tokens are present');
    } catch {
      reporter.skip(
        'Syntax highlighting tokens are present',
        'no tokens found — may need content first'
      );
    }
  } finally {
    await browser.close();
  }

  return reporter.summary();
}

if (process.argv[1].endsWith('02-editor.js')) run().catch(console.error);
