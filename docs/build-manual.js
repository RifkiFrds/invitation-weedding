// Build manual book PDF + screenshots untuk Generator Link Undangan
// Jalankan: npx playwright install chromium && node docs/build-manual.js

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const GENERATOR_URL = 'file://' + path.join(ROOT, 'undangan-fnbv2', 'generator.html').replace(/\\/g, '/');
const SHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true });

const SAMPLE_NAMES = [
    'Bapak Ahmad & Keluarga',
    'Ibu Siti Nurhayati',
    'Rifki',
    'Keluarga Bapak Budi Santoso',
    'Sdri. Dewi Anggraini'
].join('\n');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1200, height: 900 },
        deviceScaleFactor: 2
    });
    const page = await context.newPage();

    console.log('→ Opening generator...');
    await page.goto(GENERATOR_URL, { waitUntil: 'networkidle' });

    // Bersihkan localStorage supaya state konsisten
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // 1) Screenshot: halaman kosong (initial)
    console.log('→ Shot 1: initial state');
    await page.screenshot({
        path: path.join(SHOTS_DIR, '01-initial.png'),
        fullPage: true
    });

    // 2) Screenshot: form dengan nama terisi
    console.log('→ Shot 2: form filled');
    await page.fill('#names', SAMPLE_NAMES);
    await page.waitForTimeout(300);
    await page.screenshot({
        path: path.join(SHOTS_DIR, '02-form-filled.png'),
        fullPage: true
    });

    // 3) Zoom: tombol "Buat Link Undangan"
    console.log('→ Shot 3: generate button');
    const btnGen = await page.$('#btnGenerate');
    await btnGen.screenshot({ path: path.join(SHOTS_DIR, '03-btn-generate.png') });

    // 4) Klik generate → hasil
    console.log('→ Shot 4: results');
    await btnGen.click();
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({
        path: path.join(SHOTS_DIR, '04-results.png'),
        fullPage: true
    });

    // 5) Zoom: satu row hasil
    console.log('→ Shot 5: single row');
    const firstItem = await page.$('#list .item');
    if (firstItem) {
        await firstItem.screenshot({ path: path.join(SHOTS_DIR, '05-item-row.png') });
    }

    // 6) Zoom: header hasil (count badge + toolbar)
    console.log('→ Shot 6: results header');
    const resultHead = await page.$('.result-head');
    if (resultHead) {
        await resultHead.screenshot({ path: path.join(SHOTS_DIR, '06-result-head.png') });
    }

    // 7) Pengaturan Lanjutan (open)
    console.log('→ Shot 7: advanced settings');
    await page.evaluate(() => {
        const d = document.querySelector('details.tpl-details');
        if (d) d.open = true;
        window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(400);
    const advCard = await page.$('details.tpl-details');
    if (advCard) {
        // screenshot parent card supaya lebih rapi
        const advParent = await page.evaluateHandle(() =>
            document.querySelector('details.tpl-details').closest('.card')
        );
        await advParent.asElement().screenshot({
            path: path.join(SHOTS_DIR, '07-advanced.png')
        });
    }

    // 8) Mobile view screenshot
    console.log('→ Shot 8: mobile view');
    const mobile = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2
    });
    const mPage = await mobile.newPage();
    await mPage.goto(GENERATOR_URL, { waitUntil: 'networkidle' });
    await mPage.evaluate(() => localStorage.clear());
    await mPage.reload({ waitUntil: 'networkidle' });
    await mPage.fill('#names', SAMPLE_NAMES);
    await mPage.click('#btnGenerate');
    await mPage.waitForTimeout(600);
    await mPage.evaluate(() => window.scrollTo(0, 0));
    await mPage.screenshot({
        path: path.join(SHOTS_DIR, '08-mobile.png'),
        fullPage: true
    });
    await mobile.close();

    console.log('✓ All screenshots saved to', SHOTS_DIR);

    // ============================
    //  BUILD MANUAL HTML → PDF
    // ============================
    console.log('→ Building manual HTML...');
    const manualHtmlPath = path.join(__dirname, 'manual.html');
    const manualHtml = fs.readFileSync(manualHtmlPath, 'utf8');

    const manualPage = await context.newPage();
    await manualPage.setContent(manualHtml, { waitUntil: 'networkidle' });
    // Karena pakai file:// path relatif, gunakan setContent with base URL trick:
    await manualPage.goto('file://' + manualHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

    console.log('→ Exporting PDF...');
    const pdfPath = path.join(__dirname, 'Manual-Generator-Link-Undangan.pdf');
    await manualPage.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:8px;color:#888;width:100%;text-align:center;font-family:sans-serif;">Manual Generator Link Undangan — Fitria &amp; Barkah</div>',
        footerTemplate: '<div style="font-size:8px;color:#888;width:100%;text-align:center;font-family:sans-serif;">Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></div>'
    });

    console.log('✓ PDF saved to', pdfPath);

    await browser.close();
})();