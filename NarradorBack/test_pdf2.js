const fs = require('fs');
const pdfParse = require('pdf-parse');

const filePath = '../Manual de Epicteto.pdf';

try {
  const dataBuffer = fs.readFileSync(filePath);
  pdfParse(dataBuffer).then(function(data) {
      fs.writeFileSync('result.json', JSON.stringify({ success: true, pages: data.numpages }));
  }).catch(function(error) {
      fs.writeFileSync('result.json', JSON.stringify({ success: false, error: error.message, stack: error.stack }));
  });
} catch(e) {
  fs.writeFileSync('result.json', JSON.stringify({ success: false, error: e.message, stack: e.stack }));
}
