/**
 * Generates and downloads a professional receipt as an HTML file.
 * Opens in a new tab and triggers print dialog for PDF save.
 */

const receiptTranslations = {
  en: { title: "Official e-Receipt", subtitle: "Kisan-Vyapar e-Portal | National Agricultural Procurement & Trade System", txnId: "Transaction ID", date: "Date", farmer: "Farmer Name", farmerId: "Farmer Khasra ID", buyer: "Buyer / Trader", commodity: "Commodity", qty: "Quantity", rate: "Rate (₹/Qtl)", grossAmount: "Gross Amount", deductions: "Deductions / Levies", netPayable: "Net Payable Amount", paymentMode: "Payment Mode", paymentStatus: "Payment Status", settled: "Settled via DBT", pending: "Payment Pending", bankRef: "Bank Reference", footer: "This is a computer-generated receipt and does not require a physical signature.", govLine: "Government of India | Department of Agriculture & Farmers Welfare", printBtn: "Print / Save as PDF" },
  hi: { title: "आधिकारिक ई-रसीद", subtitle: "किसान-व्यापार ई-पोर्टल | राष्ट्रीय कृषि खरीद एवं व्यापार प्रणाली", txnId: "लेनदेन आईडी", date: "दिनांक", farmer: "किसान का नाम", farmerId: "किसान खसरा आईडी", buyer: "खरीदार / व्यापारी", commodity: "वस्तु", qty: "मात्रा", rate: "दर (₹/क्विंटल)", grossAmount: "कुल राशि", deductions: "कटौती / शुल्क", netPayable: "शुद्ध देय राशि", paymentMode: "भुगतान विधि", paymentStatus: "भुगतान स्थिति", settled: "DBT द्वारा निपटान", pending: "भुगतान लंबित", bankRef: "बैंक संदर्भ", footer: "यह एक कंप्यूटर जनित रसीद है और इसे भौतिक हस्ताक्षर की आवश्यकता नहीं है।", govLine: "भारत सरकार | कृषि एवं किसान कल्याण विभाग", printBtn: "प्रिंट / PDF के रूप में सेव करें" }
};

// Fallback to English for untranslated languages
const getReceiptT = (lang) => receiptTranslations[lang] || receiptTranslations.en;

export function downloadReceipt({ txnId, date, farmerName, farmerId, buyer, commodity, qty, rate, amount, status, language = 'en' }) {
  const t = getReceiptT(language);
  const deductions = Math.round(amount * 0.025); // 2.5% mandi cess
  const netPayable = amount - deductions;
  const bankRef = 'NEFT-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>${t.title} - ${txnId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      padding: 24px;
    }

    .receipt-container {
      max-width: 720px;
      margin: 0 auto;
      background: white;
      border: 2px solid #064e3b;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }

    .receipt-header {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      color: white;
      padding: 24px 32px;
      text-align: center;
      position: relative;
    }

    .receipt-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 8px, transparent 8px, transparent 16px);
    }

    .receipt-header .emblem {
      display: inline-block;
      width: 48px;
      height: 64px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      line-height: 64px;
      font-weight: 700;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .receipt-header h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .receipt-header p {
      font-size: 11px;
      opacity: 0.8;
      margin-top: 4px;
    }

    .receipt-header .gov-line {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.2);
      padding-top: 8px;
    }

    .receipt-body {
      padding: 28px 32px;
    }

    .txn-badge {
      display: inline-block;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 13px;
      font-family: monospace;
      margin-bottom: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-item {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .info-item .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .info-item .value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }

    .amount-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .amount-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
    }

    .amount-row.total {
      border-top: 2px solid #064e3b;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #064e3b;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }

    .status-settled {
      background: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .receipt-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px 32px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
    }

    .print-btn {
      display: block;
      width: 100%;
      max-width: 300px;
      margin: 20px auto 0;
      padding: 12px 24px;
      background: #064e3b;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }

    .print-btn:hover {
      background: #065f46;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(0,0,0,0.03);
      pointer-events: none;
      white-space: nowrap;
    }

    @media print {
      body { background: white; padding: 0; }
      .print-btn { display: none !important; }
      .receipt-container { border: 1px solid #ccc; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container" style="position:relative;">
    <div class="watermark">OFFICIAL</div>
    
    <div class="receipt-header">
      <div class="emblem">GOI</div>
      <h1>📜 ${t.title}</h1>
      <p>${t.subtitle}</p>
      <div class="gov-line">${t.govLine}</div>
    </div>

    <div class="receipt-body">
      <div style="text-align:center; margin-bottom: 20px;">
        <span class="txn-badge">${t.txnId}: ${txnId}</span>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="label">${t.date}</div>
          <div class="value">${date}</div>
        </div>
        <div class="info-item">
          <div class="label">${t.paymentStatus}</div>
          <div class="value">
            <span class="status-badge ${status === 'settled' ? 'status-settled' : 'status-pending'}">
              ${status === 'settled' ? '✅ ' + t.settled : '⏳ ' + t.pending}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="label">${t.farmer}</div>
          <div class="value">${farmerName}</div>
        </div>
        <div class="info-item">
          <div class="label">${t.farmerId}</div>
          <div class="value" style="font-family:monospace;">${farmerId}</div>
        </div>
        <div class="info-item">
          <div class="label">${t.buyer}</div>
          <div class="value">${buyer}</div>
        </div>
        <div class="info-item">
          <div class="label">${t.commodity}</div>
          <div class="value">${commodity}</div>
        </div>
        <div class="info-item">
          <div class="label">${t.qty}</div>
          <div class="value">${qty} Qtl</div>
        </div>
        <div class="info-item">
          <div class="label">${t.rate}</div>
          <div class="value">₹${rate.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div class="amount-section">
        <div class="amount-row">
          <span>${t.grossAmount}</span>
          <span style="font-weight:600;">₹${amount.toLocaleString('en-IN')}</span>
        </div>
        <div class="amount-row">
          <span>${t.deductions} (2.5% Mandi Cess)</span>
          <span style="color:#dc2626;">- ₹${deductions.toLocaleString('en-IN')}</span>
        </div>
        <div class="amount-row total">
          <span>${t.netPayable}</span>
          <span>₹${netPayable.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div class="info-grid" style="margin-top:16px;">
        <div class="info-item">
          <div class="label">${t.paymentMode}</div>
          <div class="value">Direct Benefit Transfer (DBT)</div>
        </div>
        <div class="info-item">
          <div class="label">${t.bankRef}</div>
          <div class="value" style="font-family:monospace;">${bankRef}</div>
        </div>
      </div>
    </div>

    <div class="receipt-footer">
      ${t.footer}
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ ${t.printBtn}</button>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
