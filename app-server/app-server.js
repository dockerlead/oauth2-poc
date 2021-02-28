'use strict';

const express = require('express');
const path = require('path');

run().catch(err => console.log(err));

async function run() {
  const app = express();

  app.use('/', express.static(path.join(__dirname, './')));

  await app.listen(3000);
  console.log('Listening on port 3000');
}
