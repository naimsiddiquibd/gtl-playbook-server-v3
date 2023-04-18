const fs = require("fs");
const Papa = require("papaparse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { Wallet } = require("ethers");

async function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath);
    const csvData = [];

    Papa.parse(fileStream, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

async function main() {
  try {
    const csvData = await readCsv("/tickets.csv");
    console.log("Parsed CSV data:", csvData);

    const updatedRecords = csvData.map((record) => {
      if (record.name && record.enrollmentNo && record.campusID && record.emailID) {
        const wallet = Wallet.createRandom();
        return {
          ...record,
          Address: wallet.address,
        };
      }
    }).filter(Boolean);

    console.log("Updated records with addresses:", updatedRecords);

    const csvWriter = createCsvWriter({
      path: "C:/Users/Mayank Sharma/Desktop/SBT-Token/tickets_with_addresses.csv",
      header: [
        { id: "eventId", title: "eventId" },
        { id: "name", title: "name" },
        { id: "enrollmentNo", title: "enrollmentNo" },
        { id: "campusID", title: "campusID" },
        { id: "Address", title: "tokenaddress" },
        { id: "emailID", title: "emailID" },
      ],
    });

    await csvWriter.writeRecords(updatedRecords);
    console.log("Output CSV file generated");
  } catch (error) {
    console.error(error);
  }
}

main();
