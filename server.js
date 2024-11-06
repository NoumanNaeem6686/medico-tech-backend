const express = require("express");
require("dotenv").config();
const cors = require("cors");

const cookieParser = require("cookie-parser");

const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const uploadRoute = require("./src/controller/uploadImage");

const app = express();

app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://medico-tech-admin-frontend-three.vercel.app/",
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/image", uploadRoute);

const port = 8000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
