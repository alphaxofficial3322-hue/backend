const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'reviews.json');

// Middleware
app.use(cors()); // Allow cross-origin requests from our frontend
app.use(express.json()); // Parse incoming JSON payloads

// Initialize our database file if it doesn't exist yet
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// GET Endpoint: Fetch all reviews
app.get('/api/reviews', (req, res) => {
    try {
        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        const reviews = JSON.parse(rawData);
        
        // Sort reviews: newest at the top
        reviews.sort((a, b) => b.timestamp - a.timestamp);
        
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error reading database:", error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST Endpoint: Submit a new review
app.post('/api/reviews', (req, res) => {
    try {
        const { name, score, text } = req.body;

        // Basic validation
        if (!name || !text) {
            return res.status(400).json({ error: 'Name and text are required' });
        }

        // Read current state of reviews
        const rawData = fs.readFileSync(DB_FILE, 'utf8');
        const reviews = JSON.parse(rawData);

        // Create new review object
        const newReview = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            name: name,
            score: parseInt(score) || 5,
            text: text,
            timestamp: Date.now() // Record exact current time
        };

        // Append to our array
        reviews.push(newReview);

        // Save back to the JSON file
        fs.writeFileSync(DB_FILE, JSON.stringify(reviews, null, 2));

        res.status(201).json(newReview);
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).json({ error: 'Failed to post review' });
    }
});

// Start listening
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Alpha X Backend running!`);
    console.log(`👉 API Endpoint: http://localhost:${PORT}/api/reviews`);
    console.log(`=========================================`);
});