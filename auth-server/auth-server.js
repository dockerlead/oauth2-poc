'use strict';

const cors = require('cors');
const express = require('express');
const path = require('path');

run().catch(err => console.log(err));

async function run() {
  const app = express();

  // Store the auth codes and access tokens in memory. In a real
  // auth server, you would store these in a database.
  const authCodes = new Set();
  const accessTokens = new Set();

  app.use(express.json());

  // Generate an auth code and redirect to your app client's
  // domain with the auth code
  app.post('/code', (req, res) => {
    // Generate a string of 10 random digits
    const authCode = new Array(10).fill(null).map(() => Math.floor(Math.random() * 10)).join('');

    authCodes.add(authCode);

    // Normally this would be a `redirect_uri` parameter, but for
    // this example it is hard coded.
    res.redirect(`http://localhost:3000/oauth-callback.html?code=${authCode}`);
  });

  app.options('/token', cors(), (req, res) => res.end());
  app.options('/secure', cors(), (req, res) => res.end());

  // Verify an auth code and exchange it for an access token
  app.post('/token', cors(), (req, res) => {
    if (authCodes.has(req.body.code)) {
      // Generate a string of 50 random digits
      const token = new Array(50).fill(null).map(() => Math.floor(Math.random() * 10)).join('');

      authCodes.delete(req.body.code);
      accessTokens.add(token);
      res.json({ 'access_token': token, 'expires_in': 60 * 60 * 24 });
    } else {
      res.status(400).json({ message: 'Invalid auth token' });
    }
  });

    // Endpoint secured by auth token
  app.get('/secure', cors(), (req, res) => {
    const authorization = req.get('authorization');
    if (!accessTokens.has(authorization)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    return res.json({ response: "You are authorized!" });
  });

  // Serve up `oauth-dialog.html`
  app.use(express.static(path.join(__dirname, './')));

  await app.listen(3001);
  console.log('Listening on port 3001');
}
