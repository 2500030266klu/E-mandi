const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();

doc.pipe(fs.createWriteStream('./public/user_manual.pdf'));

doc.fontSize(24).text('Kisan-Vyapar e-Portal User Manual', { align: 'center' });
doc.moveDown();

doc.fontSize(18).text('1. For Farmers');
doc.fontSize(12).text(`
Step 1: Go to the Home Page and click on "Farmer Portal" or "Help".
Step 2: Enter your Mobile Number and Khasra ID to request an OTP.
Step 3: Enter the OTP to log into your dashboard.
Step 4: Click on "List Produce" to add your crops to the market.
Step 5: View active bids from traders and accept the best price.
`);
doc.moveDown();

doc.fontSize(18).text('2. For Traders');
doc.fontSize(12).text(`
Step 1: Go to the Trader Portal login page.
Step 2: Enter your trading license number and password.
Step 3: Navigate to "Active Auctions" to view listed produce.
Step 4: Submit your bid and wait for the farmer's approval.
Step 5: Complete the digital payment once the bid is accepted.
`);
doc.moveDown();

doc.fontSize(18).text('3. For Admins');
doc.fontSize(12).text(`
Step 1: Log in via the Department Admin Portal using your credentials.
Step 2: Review pending trader licenses in the "Approvals" tab.
Step 3: Resolve disputes by navigating to the "Disputes" section.
Step 4: Monitor district-wide trade volume and generate reports.
`);
doc.moveDown();

doc.fontSize(12).text('For further assistance, contact our Toll-Free Helpline: 1800-180-1551', { align: 'center' });

doc.end();
console.log('PDF generated successfully at ./public/user_manual.pdf');
