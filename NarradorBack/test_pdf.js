const fs = require('fs');
const pdfParse = require('pdf-parse');

const filePath = '../Manual de Epicteto.pdf';
const dataBuffer = fs.readFileSync(filePath);

pdfParse(dataBuffer).then(function(data) {
    console.log("SUCCESS");
    console.log("Pages:", data.numpages);
    console.log("Text (first 100 chars):", data.text.substring(0, 100));
}).catch(function(error) {
    console.error("ERROR PARSING PDF:");
    console.error(error);
});
