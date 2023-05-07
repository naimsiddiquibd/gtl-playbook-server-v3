const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const csvtojson = require('csvtojson');
const cors = require('cors');
const { exec } = require('child_process');

let commandsExecuted = false;

const executeCommands = () => {
  exec('npx hardhat run scripts/deploy_SBTToken.js --network mumbai', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });

  exec('npx hardhat run scripts/mintTokens.js --network mumbai', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });

  exec('node generateRealTickets.js', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });

  exec('node Emailer.js', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });

  commandsExecuted = true;
};

const app = express();
const port = process.env.PORT || 8000;

// Define the storage for uploaded CSV files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Create the multer middleware
const upload = multer({ storage });

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost/gtl2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define the schema for the CSV data
const csvSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String
});

// Define the model for the CSV data
const CsvModel = mongoose.model('CsvModel', csvSchema);

// Use cors middleware
app.use(cors());

// Define the API route for uploading CSV files
app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  const csvFilePath = req.file.path;
  try {
    const csvData = await csvtojson().fromFile(csvFilePath);
    await CsvModel.insertMany(csvData);

    if (!commandsExecuted) {
      executeCommands();
    }

    res.send('CSV file uploaded successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error uploading CSV file');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
