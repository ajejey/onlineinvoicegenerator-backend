const express = require('express');
const router = express.Router();
const { generateQuotePDF } = require('../services/quoteService');

/**
 * @route   POST /api/quotes/generate-pdf
 * @desc    Generate a PDF from quote data
 * @access  Public
 */
router.post('/generate-pdf', async (req, res) => {
  try {
    const quoteData = req.body; // In quotePdfService.ts, we send quoteData directly as body
    // const { quoteData, options } = req.body; // If you plan to send options separately

    // Validate quote data
    if (!quoteData) {
      return res.status(400).json({ error: 'Quote data is required' });
    }
    if (!quoteData.quoteNumber) {
        // Basic validation, can be expanded
        console.warn('Quote number missing in quoteData:', quoteData);
        // return res.status(400).json({ error: 'Quote number is required for filename generation.' });
        // Allowing it for now, but filename will be generic
    }

    // TODO: Add options if you plan to pass them from frontend, similar to invoice PDF generation
    const options = {}; // Placeholder for any PDF generation options specific to quotes

    // Generate PDF
    const pdfBuffer = await generateQuotePDF(quoteData, options);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    const fileName = `Quote-${quoteData.quoteNumber || 'document'}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Send PDF buffer as response
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in Quote PDF generation route:', error);
    // Send a more specific error if it's the template not found error
    if (error.message && error.message.includes('template file not found')) {
        return res.status(500).json({ error: 'Failed to generate PDF', message: error.message });
    }
    res.status(500).json({ error: 'Failed to generate PDF', message: error.message || 'An unexpected error occurred' });
  }
});

module.exports = router;
