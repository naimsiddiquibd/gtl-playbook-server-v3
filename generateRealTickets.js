const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const { createCanvas, loadImage } = require('canvas');
const csv = require('csv-parser');
const QRCode = require('qrcode');

// const inputFile = 'C:/Users/Mayank Sharma/Desktop/SBT-Token/tickets_with_addresses.csv';
// const outputDir = 'tickets';

const uploadDirectory = './uploads';
const outputDir = 'tickets';

let latestFile = null;
let latestTime = 0;

fs.readdirSync(uploadDirectory).forEach((file) => {
  const filePath = path.join(uploadDirectory, file);
  const stats = fs.statSync(filePath);
  if (stats.isFile() && stats.mtimeMs > latestTime) {
    latestFile = filePath;
    latestTime = stats.mtimeMs;
  }
});

if (latestFile) {
  console.log(`Latest file: ${latestFile}`);
} else {
  console.log('No files found in the upload directory.');
}

const inputFile = latestFile;
const ticketTemplateFile = 'ticket_template.jpg';



SBTTokenaddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
async function generateTicket(eventId, name, enrollmentNo, campusID, tokenaddress) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed the Helvetica font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Add a new page to the document
  const page = pdfDoc.addPage([600, 400]);

  // Draw the ticket template image on the page
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');
  const ticketTemplate = await loadImage(ticketTemplateFile);
  ctx.drawImage(ticketTemplate, 0, 0, 600, 400);
  const pngBytes = canvas.toBuffer();
  const ticketImage = await pdfDoc.embedPng(pngBytes);
  page.drawImage(ticketImage, { x: 0, y: 0 });

  // Draw the text on the page
  page.drawText(`${eventId}`, { x: 180, y: 215 , size: 16, font });
  page.drawText(`${name}`, { x: 170, y: 190, size: 15, font });
  page.drawText(`${enrollmentNo}`, { x: 235, y: 160, size: 15, font });
  page.drawText(`${campusID}`, { x: 200, y: 135, size: 16, font });
  page.drawText(`${tokenaddress}`, { x: 215, y: 88, size: 14, font });

  // Generate QR code for SBTToken contract on Polygon Mumbai network
  const qrCode = await QRCode.toDataURL(`https://polygonscan.com/address/${SBTTokenaddress}`);
  const qrCodeImage = await pdfDoc.embedPng(Buffer.from(qrCode.split(',')[1], 'base64'));
  page.drawImage(qrCodeImage, { x: 350, y: 100, width: 250, height: 250 });

  // Serialize the PDF document to bytes
  const pdfBytes = await pdfDoc.save();

  // Save the PDF document to a file
  await fs.promises.writeFile(`${outputDir}/${name}_${enrollmentNo}.pdf`, pdfBytes);
}


async function generateTickets() {
  console.log('Generating PDF tickets...');

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', async (row) => {
      await generateTicket(row.eventId, row.name, row.enrollmentNo, row.campusID, row.tokenaddress);
    })
    .on('end', () => {
      console.log('All tickets generated!');
    });
}


async function main() {
  await generateTickets();
}

main();
