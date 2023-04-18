const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const csv = require('csv-parser');

const folderPath='./tickets';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth : {
        user: 'madhav04042001@gmail.com',
        pass : 'qjwqktcxmthntbqj'
    }
});

// Read the latest file from the folder
fs.readdir(folderPath, (err, files) => {
  if (err) throw err;

  // Sort files by modification time, latest first
  files.sort((a, b) => {
    return fs.statSync(path.join(folderPath, b)).mtime.getTime() -
           fs.statSync(path.join(folderPath, a)).mtime.getTime();
  });

  // Get the latest file name
  const latestFile = files[0];
  const csvFilePath = path.join(folderPath, latestFile);

  // Create a read stream for the latest CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      const name = row.name;
      const enrollmentNo = row.enrollmentNo;
      const organization = row.organization;
      const emailID = row.emailID;
      const pdfFileName = `${name}_${enrollmentNo}.pdf`;
      const pdfFilePath = path.join(folderPath, pdfFileName);
      console.log(pdfFileName);
      console.log(pdfFilePath);

      const mailOptions = {
          from: 'madhav04042001@gmail.com',
          to : emailID,
          subject: 'PDF File',
          attachments: [{
              filename: pdfFileName,
              path: pdfFilePath
          }],
          html: `<p>Hello ${name},<p>
          <p>Please find attached the PDF file for Enrollment Number ${enrollmentNo}.</p>
          <p>Regards,</p>
          <p>${organization}</p>`
          // html:"hello world"
      };

      transporter.sendMail(mailOptions,(error,info) => {
          if(error){
              console.log("error");
              console.log(error);
          } else {
              // console.log(`Email sent to ${emailID} : ${info.response}`);
              console.log('sent');
          }
      });
    })
    .on('end', ()=>{
      console.log('Finished sending emails.')
    });
});
