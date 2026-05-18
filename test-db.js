const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/jobscoutai";

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
})();
