const express = require('express');
const cors = require('cors');
const path = require('path');
const pdfRoutes = require('./routes/pdfRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const poRoutes = require('./routes/poRoutes');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5000', 'https://invoicegeneratoronline.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set view engine to ejs
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'templates'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/purchase-orders', poRoutes);

// Route to render quote template
// app.get('/quote-template', (req, res) => {
//   const quoteData = {
//     company: { name: 'Sample Company', address: 'Sample Address', email: 'sample@email.com', phone: '123-456-7890' },
//     client: { name: 'Sample Client', address: 'Client Address', email: 'client@email.com', phone: '123-456-7890' },
//     quoteNumber: 'Q-12345',
//     date: new Date().toISOString().split('T')[0],
//     validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     items: [{ description: 'Sample Item', quantity: 1, rate: 100, amount: 100 }],
//     subtotal: 100,
//     total: 100,
//     notes: 'Sample notes',
//     terms: 'Sample terms and conditions'
//   };
  
//   res.render('quote', { 
//     quoteData,
//     formatDate: date => new Date(date).toLocaleDateString(),
//     formatCurrency: amount => Number(amount).toFixed(2),
//     pdfOptions: {
//       format: 'A4',
//       printBackground: true,
//       margin: {
//         top: '15mm',
//         right: '15mm',
//         bottom: '15mm',
//         left: '15mm'
//       },
//       preferCSSPageSize: false,
//       displayHeaderFooter: false,
//       headerTemplate: '',
//       footerTemplate: '',
//       landscape: false
//     }
//   });
// });

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Invoice Generator API is running. Use /api/pdf endpoints for PDF generation.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
