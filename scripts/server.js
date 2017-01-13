const express = require("express");
const path = require('path');

const dir = path.resolve(__dirname + "/..");
const port = 8080;
const server = express()
      .use("/", express.static(dir + "/"))
      .get("/", (req, res) => res.sendFile(dir + "/index.html"))
      .listen(port);

console.log(`runing on port ${port}`);
