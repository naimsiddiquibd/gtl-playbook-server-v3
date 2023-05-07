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

  // exec('node Emailer.js', (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log(stdout);
  // });

  commandsExecuted = true;
};

const app = express();
app.use(express.json());
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
  eventId: String,
  name: String,
  enrollmentNo: String,
  campusID: String,
  tokenaddress: String,
  emailID: String
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
    const newData = csvData.map((data) => ({
      eventId: data.eventId,
      name: data.name,
      enrollmentNo: data.enrollmentNo,
      campusID: data.campusID,
      tokenaddress: data.tokenaddress,
      emailID: data.emailID
    }));
    await CsvModel.insertMany(newData);

    if (!commandsExecuted) {
      executeCommands();
    }

    res.send('CSV file uploaded successfully');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error uploading CSV file');
  }
});

// Define the API route for fetching CSV data
app.get('/api/csv-data', async (req, res) => {
  try {
    const csvData = await CsvModel.find({});
    res.send(csvData);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching CSV data');
  }
});

// Define event schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

// Define event model
const Event = mongoose.model('Event', eventSchema);


// Define API endpoints
app.post('/api/events', upload.single('coverImage'), async (req, res) => {
  const { title, description, startDate, endDate } = req.body;
  const coverImage = req.file.filename;

  const event = new Event({ title, description, coverImage, startDate, endDate });

  try {
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Define the itinerary schema
const itinerarySchema = new mongoose.Schema({
  title: String,
  description: String,
  day: String,
  startTime: String,
  endTime: String,
});

// Define the itinerary model
const Itinerary = mongoose.model('Itinerary', itinerarySchema);

// Define the itinerary API endpoint
app.post('/app/itinerary', async (req, res) => {
  try {
    const itinerary = new Itinerary({
      title: req.body.title,
      description: req.body.description,
      day: req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    const savedItinerary = await itinerary.save();
    res.json(savedItinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Define the itinerary API endpoint to retrieve all itineraries
app.get('/app/itinerary', async (req, res) => {
  try {
    const itineraries = await Itinerary.find();
    res.json(itineraries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// define a schema for the organization
const organizationSchema = new mongoose.Schema({
  name: String,
  designation: String,
  mobileNumber: String,
  email: String,
  photo: String,
  bio: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
  },
});

// create a model for the organization
const Organization = mongoose.model('Organization', organizationSchema);

// define a route for creating a new organization
app.post('/api/organizations', upload.single('photo'), async (req, res) => {
  try {
    const {
      name,
      designation,
      mobileNumber,
      email,
      bio,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    const organization = new Organization({
      name,
      designation,
      mobileNumber,
      email,
      bio,
      socialMedia: {
        facebook,
        twitter,
        linkedin,
        instagram,
      },
      photo: req.file.filename,
    });

    await organization.save();
    res.status(201).json(organization);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// define a route for getting all organizations
app.get('/api/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Define Campus schema
const campusSchema = new mongoose.Schema({
  name: String,
  location: String
});

// Define Campus model
const Campus = mongoose.model('Campus', campusSchema);

// Create POST route for "campus" API
app.post('/api/campus', async (req, res) => {
  try {
    const { name, location } = req.body;
    const campus = new Campus({ name, location });
    await campus.save();
    res.status(201).json(campus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create GET route for "campus" API
app.get('/api/campus', async (req, res) => {
  try {
    const campuses = await Campus.find();
    res.json(campuses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
