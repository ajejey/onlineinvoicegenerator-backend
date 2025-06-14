const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a number as currency
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '0.00';
  return value.toFixed(2);
};

/**
 * Generate a PDF from quote data
 * @param {Object} quoteData - The quote data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateQuotePDF = async (quoteData, options = {}) => {
  try {
    console.log('Quote PDF service received options:', JSON.stringify(options, null, 2));
    
    // Default options (can be adjusted for quotes if needed)
    const pdfOptions = {
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: options.preferCSSPageSize || false,
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      landscape: options.landscape || false
    };
    
    console.log('Final Quote PDF options being used:', JSON.stringify(pdfOptions, null, 2));

    // Render the EJS template with the quote data and options
    const templatePath = path.join(__dirname, '../templates/quote.ejs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    const html = ejs.render(templateContent, {
      quoteData,
      formatDate,
      formatCurrency,
      pdfOptions // Pass the PDF options to the template
    });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });
    
    console.log('Generating Quote PDF with options:', JSON.stringify(pdfOptions, null, 2));
    const pdf = await page.pdf(pdfOptions);

    await browser.close();

    return pdf;
  } catch (error) {
    console.error('Error generating Quote PDF:', error);
    // If the error is due to missing template, provide a specific message
    if (error.code === 'ENOENT' && error.path && error.path.includes('quote.ejs')) {
      throw new Error(`Quote template file not found at ${error.path}. Please ensure 'quote.ejs' exists in the templates directory.`);
    }
    throw error;
  }
};

module.exports = {
  generateQuotePDF
};
