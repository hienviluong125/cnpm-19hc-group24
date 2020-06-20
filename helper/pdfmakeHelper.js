const PdfPrinter = require('pdfmake');
const fs = require('fs');
const moment = require('moment');

const createPdf = async (docDefinition) => {
  let fonts = {
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    }
  }
  let printer = new PdfPrinter(fonts);
  let pdfDoc = printer.createPdfKitDocument(docDefinition);

  return new Promise((resolve, reject) => {
    try {
      var chunks = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    } catch (err) {
      reject(err);
    }
  });
}

const paymentPdf = (paymentInfo) => {
  var dd = {
    content: [
      {
        text: [{ text: 'Payment Receipt\n\n', alignment: 'center', fontSize: 40 }]
      },
      {
        text: [
          {
            text: 'Invoice to\n\n', bold: true, style: 'header', pageBreak: 'abefore'
          },
          {
            text: `Name: ${paymentInfo.user.first_name} ${paymentInfo.user.last_name}\n\nAddress: ${paymentInfo.user.address} \n\nPhone: ${paymentInfo.user.phone}\n\nDate: ${moment(paymentInfo.date).format('MMMM Do YYYY')}\n\nAmount: ${paymentInfo.amount}\n\nPayment method: ${paymentInfo.method}\n\nComment: ${paymentInfo.comment}`, pageBreak: 'before', fontSize: 11
          },
          {
            text: '\n\n'
          }
        ],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
      {
        text: '\nTotal\n\n', alignment: 'right', bold: true
      },
      {
        text: `${paymentInfo.amount}`, alignment: 'right'
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 100]
      }
    },
    defaultStyle: {
      font: 'Helvetica'
    }
  }
  return createPdf(dd);
}

module.exports = {
  paymentPdf,
}
