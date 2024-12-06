const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require('./google-services.json')),
  databaseURL: "https://text-adventure-55f7e.firebaseio.com"
});

const db = admin.firestore();

// Endpoint to Fetch Game State
app.get('/api/game_states/:path', async (req, res) => {
  try {
    const snapshot = await db.collection('game_states').where('path', '==', req.params.path).get();
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Game state not found' });
    }

    const gameState = snapshot.docs[0].data();
    res.json(gameState);
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
