const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const csvtojson = require('csvtojson');
const cors = require('cors');

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
app.post('/api/upload-csv', upload.single('file'), (req, res) => {
    const csvFilePath = req.file.path;
    csvtojson()
      .fromFile(csvFilePath)
      .then(csvData => {
        CsvModel.insertMany(csvData)
          .then(result => {
            res.send('CSV file uploaded successfully');
          })
          .catch(err => {
            console.log(err);
            res.status(500).send('Error uploading CSV file');
          });
      });
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
