const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

module.exports = app;