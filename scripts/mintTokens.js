const fs = require("fs");
const parse = require("csv-parser");
const { ethers } = require("hardhat");

const mintTokens = async () => {
  try {
    console.log("Starting mintTokens script...");

    // Get the signer
    const [signer] = await ethers.getSigners();

    const SBTToken = await ethers.getContractFactory("SBTToken");
    const sbtToken = await SBTToken.attach(
      "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    ).connect(signer); // Connect the signer to the contract
    console.log("SBTToken instance created:", sbtToken.address);

    const csvPath =
      "/tickets_with_addresses.csv";
    console.log("Reading CSV file:", csvPath);

    fs.createReadStream(csvPath)
      .pipe(parse({ headers: true }))
      .on("data", async (row) => {
        if (row.name && row.enrollmentNo && row.campusID && row.Address && row.emailID) {
          console.log("Processing row:", row);

          const name = row["name"];
          const enrollmentNo = row["enrollmentNo"];
          const campusID = row["campusID"];
          const to = row["Address"];

          console.log(`Minting SBT Token for ${name} (${to})`);

          const tokenURI = `Name: ${name}, Enrollment No: ${enrollmentNo}, Campus ID: ${campusID}`;
          await sbtToken.mintToken(to, tokenURI);

          console.log(`Minted SBT Token for ${name} (${to})`);
        }
      })
      .on("end", () => {
        console.log("CSV file processed");
      });

  } catch (error) {
    console.error(error);
  }
};

mintTokens();
