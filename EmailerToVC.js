const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const csv = require('csv-parser');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth : {
        user: 'madhav04042001@gmail.com',
        pass : 'qjwqktcxmthntbqj'
    }
});

fs.createReadStream('/vc_emails.csv')
  .pipe(csv())
  .on('data', (row) => {
    const name = row.name;
    const emailID = row.emailID;
    const organization = row.organization;

    console.log(`Sending email to ${emailID}`);

    const imagePath = '/Image.jpg'; // Update this to the path of your local image file
    const mailOptions = {
        from: 'madhav04042001@gmail.com',
        to : emailID,
        subject: 'Invitation to the Global Treeball League',
        attachments: [
            {
                filename: 'image.jpg',
                path: imagePath,
                cid: 'imageCID'
            }
        ],
        html: `
        <div style="font-family: 'Georgia', serif; font-size: 18px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; background-color: #f8f1e1; padding: 40px 40px 30px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);">
          <h1 style="font-size: 36px; color: #4a4a4a; margin-bottom: 20px; text-align: center; font-weight: bold;">Global Treeball League</h1>
          <p>Dear ${name},</p>
          <p>We are honored to invite you to the upcoming <strong style="color: #b5833c;">Global Treeball League</strong> as a distinguished guest. The event promises to bring together the finest players in the sport, and we believe your presence will elevate the experience for everyone involved.</p>
          <p>As a key figure in the <strong style="color: #b5833c;">${organization}</strong>, your support and participation will be invaluable to the success of the Global Treeball League.</p>
          <p>Please find the event details below:</p>
          <p><strong>Date:</strong> [Event Date]</p>
          <p><strong>Time:</strong> [Event Time]</p>
          <p><strong>Venue:</strong> [Event Venue]</p>
          <p>We look forward to your presence at the event. Kindly RSVP by replying to this email.</p>
          <p>Warm Regards,</p>
          <p>Global Treeball League Team</p>
          <p style="text-align: center;"><img src="cid:imageCID" alt="Image description" style="max-width: 100%; height: auto;"></p>
        </div>`
    };

    transporter.sendMail(mailOptions,(error,info) => {
        if(error){
            console.log("error");
            console.log(error);
        } else {
            console.log(`Email sent to ${emailID} : ${info.response}`);
        }
    });
});
