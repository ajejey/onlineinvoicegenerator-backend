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
  return value.toFixed(2);
};

/**
 * Generate a PDF from invoice data
 * @param {Object} invoiceData - The invoice data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = async (invoiceData, options = {}) => {
  try {
    console.log('PDF service received options:', JSON.stringify(options, null, 2));
    
    // Default options
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
    
    // Log the final PDF options being used
    console.log('Final PDF options being used:', JSON.stringify(pdfOptions, null, 2));

    // Render the EJS template with the invoice data and options
    const templatePath = path.join(__dirname, '../templates/invoice.ejs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    const html = ejs.render(templateContent, {
      invoiceData,
      formatDate,
      formatCurrency,
      pdfOptions // Pass the PDF options to the template
    });

    // Launch a new browser instance
    const browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create a new page
    const page = await browser.newPage();
    
    // Set the content of the page
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Set viewport size to ensure proper rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });
    
    // Generate the PDF
    console.log('Generating PDF with options:', JSON.stringify(pdfOptions, null, 2));
    const pdf = await page.pdf(pdfOptions);

    // Close the browser
    await browser.close();

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a PDF and save it to a file
 * @param {Object} invoiceData - The invoice data
 * @param {string} outputPath - The path to save the PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<string>} Path to the saved PDF
 */
const generateAndSaveInvoicePDF = async (invoiceData, outputPath, options = {}) => {
  try {
    const pdf = await generateInvoicePDF(invoiceData, options);
    fs.writeFileSync(outputPath, pdf);
    return outputPath;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

module.exports = {
  generateInvoicePDF,
  generateAndSaveInvoicePDF
};
