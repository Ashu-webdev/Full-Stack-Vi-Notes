require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});