import puppeteer from 'puppeteer';

export async function generatePdf() {
  const URL = 'http://localhost:3000/public/index.html';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.emulateMediaType('screen');
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  return pdf;
}