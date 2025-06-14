const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');

const generatePoPdf = async (poData) => {
  try {
    // 1. Render EJS template to HTML
    const templatePath = path.join(__dirname, '..', 'templates', 'purchaseOrder.ejs');
    const html = await ejs.renderFile(templatePath, { poData });

    // 2. Launch Puppeteer and create PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for running in a containerized environment
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating purchase order PDF:', error);
    throw new Error('Failed to generate PDF.');
  }
};

module.exports = { generatePoPdf };
