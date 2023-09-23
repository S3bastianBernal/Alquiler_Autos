const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();

const endpointRouter = require('./routes/routes.js');
app.use('/api/Alquiler', endpointRouter);

require('dotenv').config;
const port = process.env.PORT256
app.use(express.json());
app.listen(port, () =>{
  console.log(`server running on port ${port}`);
})