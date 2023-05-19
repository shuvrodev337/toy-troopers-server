const express = require("express");
const app = express();
require('dotenv').config()
const cors = require("cors");
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json())


app.get("/", (req, res) => {
    res.send("Hello World! Toy Troopers Server is running!!");
  });





  app.listen(port, () => {
    console.log(`Toy Troopers server listening on port ${port}`);
  });