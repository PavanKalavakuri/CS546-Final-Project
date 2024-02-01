const fs = require("fs");
const { getDocs, ObjectId } = require("./../config/mongoCollections");
const { closeConnection } = require("./../config/mongoConnection");

const pictures = async () => {
  var docs = await getDocs();
  docs = await docs.distinct("_id");
  var docs_id = []
  docs.forEach(element => {
      docs_id.push(element.toString())
  });
  await closeConnection();

  getCurrentFilenames();

  for (let i = 0; i < docs_id.length; i++) {
    fs.copyFile(`images/Doctor${i+1}.png`, `../public/img/${docs_id[i]}.png`, (err) => {
        if (err) {
          console.log("Error Found:", err);
        }
        else {
          // Get the current filenames
          console.log("File Renamed")
        }
      });
  }



  console.log(docs_id);
};

function getCurrentFilenames() {
    console.log("\nCurrent filenames:");
    fs.readdirSync(__dirname+ "/../").forEach(file => {
      console.log(file);
    });
  }

pictures();



