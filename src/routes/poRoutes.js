const express = require('express');
const { generatePoPdf } = require('../services/poService');

const router = express.Router();

router.post('/generate-pdf', async (req, res) => {
  try {
    const poData = req.body;

    // Basic validation
    if (!poData || !poData.poNumber) {
      return res.status(400).send('Invalid purchase order data.');
    }

    const pdfBuffer = await generatePoPdf(poData);

    // Send PDF back to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PO-${poData.poNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Failed to generate PO PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

module.exports = router;

