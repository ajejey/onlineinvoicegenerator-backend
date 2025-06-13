const express = require('express');
const router = express.Router();
const { generateInvoicePDF } = require('../services/pdfService');

/**
 * @route POST /api/pdf/generate
 * @desc Generate a PDF from invoice data
 * @access Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { invoiceData, options } = req.body;
    
    // Debug log the options received from frontend
    console.log('PDF generation options received:', JSON.stringify(options, null, 2));
    
    // Validate invoice data
    if (!invoiceData) {
      return res.status(400).json({ error: 'Invoice data is required' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData, options);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`);
    
    // Send PDF buffer as response
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in PDF generation route:', error);
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
  }
});

/**
 * @route POST /api/pdf/preview
 * @desc Generate a PDF and return as base64 for preview
 * @access Public
 */
router.post('/preview', async (req, res) => {
  try {
    const { invoiceData, options } = req.body;
    
    // Validate invoice data
    if (!invoiceData) {
      return res.status(400).json({ error: 'Invoice data is required' });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData, options);
    
    // Convert buffer to base64
    const base64Pdf = pdfBuffer.toString('base64');
    
    // Send base64 PDF as response
    res.json({ 
      success: true, 
      filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
      pdfBase64: base64Pdf 
    });
  } catch (error) {
    console.error('Error in PDF preview route:', error);
    res.status(500).json({ error: 'Failed to generate PDF preview', message: error.message });
  }
});

/**
 * @route GET /api/pdf/options
 * @desc Get available PDF generation options
 * @access Public
 */
router.get('/options', (req, res) => {
  // Return available PDF options for the frontend
  const availableOptions = {
    formats: ['A4', 'A3', 'Letter', 'Legal', 'Tabloid'],
    orientations: ['portrait', 'landscape'],
    margins: {
      default: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      narrow: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      wide: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm'
      }
    }
  };
  
  res.json(availableOptions);
});

module.exports = router;
